import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { authStorage } from "./replit_integrations/auth/storage";
import { Cashfree as CashfreeSDK, CFEnvironment } from "cashfree-pg";
import Razorpay from "razorpay";
import crypto from "crypto";
import { hasPermission, isAdminRole, type Permission } from "@shared/models/auth";
import { orders as ordersTable } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { sendOrderConfirmation, sendShippingUpdate, sendPromotionalEmail, sendReturnRequestEmail } from "./email";
import { sendOrderNotification, startAbandonedCartChecker } from "./whatsapp";

function getCashfreeInstance() {
  const clientId = process.env.CASHFREE_APP_ID || "";
  const clientSecret = process.env.CASHFREE_SECRET_KEY || "";
  const env = process.env.CASHFREE_ENV === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  const instance = new (CashfreeSDK as any)(env, clientId, clientSecret);
  instance.XApiVersion = "2023-08-01";
  return instance;
}

function getRazorpayInstance(keyId: string, keySecret: string) {
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function getUserId(req: any): string {
  return (req.session as any)?.userId;
}

async function isAdmin(req: any, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await authStorage.getUser(userId);
  if (!user) return res.status(403).json({ message: "Forbidden" });
  const role = user.role || (user.isAdmin ? "super_admin" : "customer");
  if (!isAdminRole(role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

function requirePermission(...perms: Permission[]) {
  return async (req: any, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await authStorage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const role = user.role || (user.isAdmin ? "super_admin" : "customer");
    const allowed = perms.some((p) => hasPermission(role, p));
    if (!allowed) return res.status(403).json({ message: "Insufficient permissions" });
    next();
  };
}

const addCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
  size: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

const updateCartSchema = z.object({
  quantity: z.number().int().min(1),
});

const shippingAddressSchema = z.object({
  fullName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  phone: z.string().min(1),
});

const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  couponCode: z.string().nullable().optional(),
  paymentMethod: z.enum(["cashfree", "razorpay", "cod"]).optional().default("cashfree"),
});

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.string(),
  compareAtPrice: z.string().nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  images: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  material: z.string().nullable().optional(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  weight: z.number().int().min(0).default(0),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
});

import { insertCouponSchema, insertCategorySchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  startAbandonedCartChecker();

  app.get("/api/categories", async (_req, res) => {
    try {
      const cats = await storage.getCategories();
      res.json(cats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const featured = req.query.featured === "true";
      const prods = featured ? await storage.getFeaturedProducts() : await storage.getProducts();
      res.json(prods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/best-selling", async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      const productCounts: Record<number, number> = {};
      for (const order of allOrders) {
        const items = order.items as any[];
        if (Array.isArray(items)) {
          for (const item of items) {
            productCounts[item.productId] = (productCounts[item.productId] || 0) + (item.quantity || 1);
          }
        }
      }
      const allProducts = await storage.getProducts();
      const sorted = allProducts
        .map((p) => ({ ...p, soldCount: productCounts[p.id] || 0 }))
        .sort((a, b) => b.soldCount - a.soldCount || (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      res.json(sorted.slice(0, 8));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch best-selling products" });
    }
  });

  app.get("/api/products/ratings/batch", async (req: Request, res: Response) => {
    try {
      const ids = (req.query.ids as string || "").split(",").map(Number).filter(n => !isNaN(n));
      if (ids.length === 0) return res.json({});
      const ratings = await storage.getProductsAverageRatings(ids);
      res.json(ratings);
    } catch (error) {
      console.error("Batch ratings error:", error);
      res.status(500).json({ message: "Failed to get ratings" });
    }
  });

  app.get("/api/products/by-id/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(Number(req.params.id));
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const items = await storage.getCartItems(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = addCartSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.flatten() });
      }
      const userId = getUserId(req);
      const { productId, quantity, size, color } = parsed.data;
      const item = await storage.addCartItem({
        userId,
        productId,
        quantity,
        size: size || null,
        color: color || null,
      });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = updateCartSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.flatten() });
      }
      const userId = getUserId(req);
      const id = parseInt(req.params.id);
      const item = await storage.updateCartItem(id, userId, parsed.data.quantity);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const id = parseInt(req.params.id);
      await storage.removeCartItem(id, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const userOrders = await storage.getOrders(userId);
      res.json(userOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid shipping address", errors: parsed.error.flatten() });
      }
      const userId = getUserId(req);

      const cartItemsData = await storage.getCartItems(userId);
      if (cartItemsData.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const items = cartItemsData.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        imageUrl: item.product.images?.[0] || null,
        weight: (item.product as any).weight || 0,
      }));

      const totalAmount = cartItemsData
        .reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
        .toFixed(2);

      const subtotal = Number(totalAmount);
      const shipping = subtotal >= 1000 ? 0 : 80;
      let discount = 0;

      if (parsed.data.couponCode) {
        const coupon = await storage.getCouponByCode(parsed.data.couponCode);
        if (coupon && coupon.isActive) {
          if (coupon.discountType === "free_shipping") {
            discount = shipping;
          } else if (coupon.discountType === "percentage") {
            discount = subtotal * Number(coupon.discountValue) / 100;
            if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
          } else {
            discount = Number(coupon.discountValue);
          }
        }
      }

      const finalTotal = Math.max(0, subtotal + shipping - discount).toFixed(2);

      const selectedMethod = parsed.data.paymentMethod || "cashfree";

      const ps = await storage.getPaymentSettings();
      if (selectedMethod === "razorpay" && !ps.razorpayEnabled) {
        return res.status(400).json({ message: "Razorpay is not enabled" });
      }
      if (selectedMethod === "cod" && !ps.codEnabled) {
        return res.status(400).json({ message: "Cash on Delivery is not enabled" });
      }
      if (selectedMethod === "cashfree" && !ps.cashfreeEnabled) {
        return res.status(400).json({ message: "Cashfree is not enabled" });
      }

      const order = await storage.createOrder({
        userId,
        status: selectedMethod === "cod" ? "confirmed" : "pending",
        totalAmount: finalTotal,
        shippingAddress: parsed.data.shippingAddress,
        items,
        paymentStatus: selectedMethod === "cod" ? "cod" : "pending",
        paymentMethod: selectedMethod,
      });

      await storage.clearCart(userId);

      const orderUser = await authStorage.getUser(userId);
      storage.createAdminNotification({
        type: "new_order",
        title: "New Order Received",
        message: `Order #${order.id} placed by ${orderUser?.firstName || orderUser?.email || "Customer"} for Rs. ${Number(order.totalAmount).toLocaleString("en-IN")}${selectedMethod === "cod" ? " (COD)" : ""}`,
        orderId: order.id,
      }).catch(err => console.error("Notification error:", err));

      if (selectedMethod === "cod") {
        if (orderUser?.email) {
          sendOrderConfirmation(orderUser.email, order as any).catch(err => console.error("Order confirmation email error:", err));
        }
        sendOrderNotification(order as any).catch(err => console.error("WhatsApp order notification error:", err));
        return res.json({ ...order, paymentMethod: "cod", paymentSessionId: null });
      }

      if (selectedMethod === "razorpay") {
        if (!ps.razorpayKeyId || !ps.razorpayKeySecret) {
          return res.json({ ...order, paymentSessionId: null, paymentError: "Razorpay not configured" });
        }
        try {
          const rzp = getRazorpayInstance(ps.razorpayKeyId, ps.razorpayKeySecret);
          const rzpOrder = await rzp.orders.create({
            amount: Math.round(Number(finalTotal) * 100),
            currency: "INR",
            receipt: `rvn_${order.id}`,
          });
          await storage.updateOrderPayment(order.id, { paymentStatus: "pending", cashfreeOrderId: null } as any);
          const amountInPaise = Math.round(Number(finalTotal) * 100);
          await db.update(ordersTable).set({ razorpayOrderId: rzpOrder.id }).where(eq(ordersTable.id, order.id));
          return res.json({
            ...order,
            paymentMethod: "razorpay",
            razorpayOrderId: rzpOrder.id,
            razorpayKeyId: ps.razorpayKeyId,
            amountInPaise,
            paymentSessionId: null,
          });
        } catch (rzpError: any) {
          console.error("Razorpay order creation error:", rzpError?.error || rzpError);
          return res.json({ ...order, paymentSessionId: null, paymentError: "Could not initiate Razorpay payment" });
        }
      }

      const clientId = process.env.CASHFREE_APP_ID;
      const clientSecret = process.env.CASHFREE_SECRET_KEY;

      if (!clientId || !clientSecret) {
        return res.json({ ...order, paymentSessionId: null });
      }

      const user = orderUser;
      const cashfree = getCashfreeInstance();

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const cfOrderId = `rvn_${order.id}_${Date.now()}`;

      const cfRequest = {
        order_amount: Number(finalTotal),
        order_currency: "INR",
        order_id: cfOrderId,
        customer_details: {
          customer_id: String(userId),
          customer_phone: parsed.data.shippingAddress.phone || "9999999999",
          customer_email: user?.email || "customer@example.com",
          customer_name: parsed.data.shippingAddress.fullName,
        },
        order_meta: {
          return_url: `${baseUrl}/payment/callback?order_id=${order.id}&cf_order_id=${cfOrderId}`,
        },
      };

      try {
        const cfResponse = await cashfree.PGCreateOrder(cfRequest);
        await storage.updateOrderPayment(order.id, { paymentStatus: "pending", cashfreeOrderId: cfOrderId });
        res.json({
          ...order,
          cashfreeOrderId: cfOrderId,
          paymentSessionId: cfResponse.data.payment_session_id,
        });
      } catch (cfError: any) {
        const errorDetails = cfError?.response?.data || cfError?.message || cfError;
        console.error("Cashfree order creation error:", JSON.stringify(errorDetails, null, 2));
        res.json({ ...order, paymentSessionId: null, paymentError: "Could not initiate payment" });
      }
    } catch (error) {
      console.error("Order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.delete("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const orderId = Number(req.params.id);
      const order = await storage.getOrderById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      await storage.deleteOrder(orderId, userId);
      res.json({ message: "Order deleted" });
    } catch (error) {
      console.error("Delete order error:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // One-click reorder: add all items from a past order back to cart
  app.post("/api/orders/:id/reorder", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const orderId = Number(req.params.id);
      const order = await storage.getOrderById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      const items = (order.items as any[]) || [];
      let addedCount = 0;
      for (const item of items) {
        try {
          const product = await storage.getProductById(item.productId);
          if (product && product.inStock !== false) {
            await storage.addCartItem({
              userId,
              productId: item.productId,
              quantity: item.quantity || 1,
              size: item.size || null,
              color: item.color || null,
            });
            addedCount++;
          }
        } catch {}
      }
      res.json({ message: "Items added to cart", addedCount });
    } catch (error) {
      console.error("Reorder error:", error);
      res.status(500).json({ message: "Failed to reorder" });
    }
  });

  // Admin: Delete order
  app.delete("/api/admin/orders/:id", isAuthenticated, requirePermission("manage_orders"), async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrderById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      await storage.adminDeleteOrder(orderId);
      res.json({ message: "Order deleted" });
    } catch (error) {
      console.error("Admin delete order error:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  app.get("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await authStorage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const profileSchema = z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        phone: z.string().optional(),
      });
      const parsed = profileSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid profile data", errors: parsed.error.flatten() });
      const updated = await authStorage.updateUser(userId, parsed.data);
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put("/api/user/password", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const passwordSchema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      });
      const parsed = passwordSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid request", errors: parsed.error.flatten() });

      const user = await authStorage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const bcrypt = await import("bcryptjs");
      if (user.password) {
        const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
        if (!valid) return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);
      await authStorage.updateUser(userId, { password: hashedPassword });
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.get("/api/user/addresses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const addrs = await storage.getAddresses(userId);
      res.json(addrs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post("/api/user/addresses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const addressSchema = shippingAddressSchema.extend({
        label: z.string().optional().default("Home"),
      });
      const parsed = addressSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid address data", errors: parsed.error.flatten() });
      const addr = await storage.createAddress({
        userId,
        label: parsed.data.label,
        fullName: parsed.data.fullName,
        address: parsed.data.address,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
        phone: parsed.data.phone,
        isDefault: false,
      });
      res.json(addr);
    } catch (error) {
      console.error("Create address error:", error);
      res.status(500).json({ message: "Failed to create address" });
    }
  });

  app.put("/api/user/addresses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const id = Number(req.params.id);
      const addressSchema = shippingAddressSchema.extend({
        label: z.string().optional(),
      });
      const parsed = addressSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid address data" });
      const updated = await storage.updateAddress(id, userId, parsed.data);
      if (!updated) return res.status(404).json({ message: "Address not found" });
      res.json(updated);
    } catch (error) {
      console.error("Update address error:", error);
      res.status(500).json({ message: "Failed to update address" });
    }
  });

  app.delete("/api/user/addresses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const id = Number(req.params.id);
      await storage.deleteAddress(id, userId);
      res.json({ message: "Address deleted" });
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  app.post("/api/user/addresses/:id/default", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const id = Number(req.params.id);
      await storage.setDefaultAddress(id, userId);
      res.json({ message: "Default address updated" });
    } catch (error) {
      console.error("Set default address error:", error);
      res.status(500).json({ message: "Failed to set default address" });
    }
  });

  app.get("/api/user/saved-address", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const addrs = await storage.getAddresses(userId);
      const defaultAddr = addrs.find(a => a.isDefault) || addrs[0] || null;
      res.json({ savedAddress: defaultAddr });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved address" });
    }
  });

  app.post("/api/orders/buy-now", isAuthenticated, async (req: any, res) => {
    try {
      const buyNowSchema = z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).default(1),
        size: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
        shippingAddress: shippingAddressSchema,
        couponCode: z.string().nullable().optional(),
        paymentMethod: z.enum(["cashfree", "razorpay", "cod"]).optional().default("cashfree"),
      });
      const parsed = buyNowSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });

      const userId = getUserId(req);
      const product = await storage.getProductById(parsed.data.productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      if (!product.inStock) return res.status(400).json({ message: "Product is out of stock" });

      const items = [{
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: parsed.data.quantity,
        size: parsed.data.size || undefined,
        color: parsed.data.color || undefined,
        imageUrl: product.images?.[0] || null,
        weight: product.weight || 0,
      }];

      const subtotal = Number(product.price) * parsed.data.quantity;
      const shipping = subtotal >= 1000 ? 0 : 80;
      let discount = 0;

      if (parsed.data.couponCode) {
        const coupon = await storage.getCouponByCode(parsed.data.couponCode);
        if (coupon && coupon.isActive) {
          if (coupon.discountType === "free_shipping") {
            discount = shipping;
          } else if (coupon.discountType === "percentage") {
            discount = subtotal * Number(coupon.discountValue) / 100;
            if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
          } else {
            discount = Number(coupon.discountValue);
          }
        }
      }

      const finalTotal = Math.max(0, subtotal + shipping - discount).toFixed(2);

      const selectedMethod = parsed.data.paymentMethod || "cashfree";

      const ps = await storage.getPaymentSettings();
      if (selectedMethod === "razorpay" && !ps.razorpayEnabled) {
        return res.status(400).json({ message: "Razorpay is not enabled" });
      }
      if (selectedMethod === "cod" && !ps.codEnabled) {
        return res.status(400).json({ message: "Cash on Delivery is not enabled" });
      }
      if (selectedMethod === "cashfree" && !ps.cashfreeEnabled) {
        return res.status(400).json({ message: "Cashfree is not enabled" });
      }

      const order = await storage.createOrder({
        userId,
        status: selectedMethod === "cod" ? "confirmed" : "pending",
        totalAmount: finalTotal,
        shippingAddress: parsed.data.shippingAddress,
        items,
        paymentStatus: selectedMethod === "cod" ? "cod" : "pending",
        paymentMethod: selectedMethod,
      });

      const orderUser = await authStorage.getUser(userId);
      storage.createAdminNotification({
        type: "new_order",
        title: "New Order Received",
        message: `Order #${order.id} placed by ${orderUser?.firstName || orderUser?.email || "Customer"} for Rs. ${Number(order.totalAmount).toLocaleString("en-IN")}${selectedMethod === "cod" ? " (COD)" : ""}`,
        orderId: order.id,
      }).catch(err => console.error("Notification error:", err));

      if (selectedMethod === "cod") {
        if (orderUser?.email) {
          sendOrderConfirmation(orderUser.email, order as any).catch(err => console.error("Order confirmation email error:", err));
        }
        sendOrderNotification(order as any).catch(err => console.error("WhatsApp order notification error:", err));
        return res.json({ ...order, paymentMethod: "cod", paymentSessionId: null });
      }

      if (selectedMethod === "razorpay") {
        if (!ps.razorpayKeyId || !ps.razorpayKeySecret) {
          return res.json({ ...order, paymentSessionId: null, paymentError: "Razorpay not configured" });
        }
        try {
          const rzp = getRazorpayInstance(ps.razorpayKeyId, ps.razorpayKeySecret);
          const rzpOrder = await rzp.orders.create({
            amount: Math.round(Number(finalTotal) * 100),
            currency: "INR",
            receipt: `rvn_${order.id}`,
          });
          await storage.updateOrderPayment(order.id, { paymentStatus: "pending", cashfreeOrderId: null } as any);
          await db.update(ordersTable).set({ razorpayOrderId: rzpOrder.id }).where(eq(ordersTable.id, order.id));
          const amountInPaise = Math.round(Number(finalTotal) * 100);
          return res.json({
            ...order,
            paymentMethod: "razorpay",
            razorpayOrderId: rzpOrder.id,
            razorpayKeyId: ps.razorpayKeyId,
            amountInPaise,
            paymentSessionId: null,
          });
        } catch (rzpError: any) {
          console.error("Razorpay order creation error:", rzpError?.error || rzpError);
          return res.json({ ...order, paymentSessionId: null, paymentError: "Could not initiate Razorpay payment" });
        }
      }

      const clientId = process.env.CASHFREE_APP_ID;
      const clientSecret = process.env.CASHFREE_SECRET_KEY;

      if (!clientId || !clientSecret) {
        return res.json({ ...order, paymentSessionId: null });
      }

      const cashfree = getCashfreeInstance();
      const cfOrderId = `order_${order.id}_${Date.now()}`;
      const user = orderUser;

      const cfRequest = {
        order_amount: Number(finalTotal),
        order_currency: "INR",
        order_id: cfOrderId,
        customer_details: {
          customer_id: userId,
          customer_phone: parsed.data.shippingAddress.phone || "9999999999",
          customer_email: user?.email || "customer@example.com",
          customer_name: parsed.data.shippingAddress.fullName || "Customer",
        },
        order_meta: {
          return_url: `${req.protocol}://${req.get("host")}/payment/callback?order_id=${order.id}&cf_order_id=${cfOrderId}`,
        },
      };

      try {
        const cfResponse = await cashfree.PGCreateOrder(cfRequest);
        await storage.updateOrderPayment(order.id, { paymentStatus: "pending", cashfreeOrderId: cfOrderId });
        res.json({
          ...order,
          cashfreeOrderId: cfOrderId,
          paymentSessionId: cfResponse.data?.payment_session_id || null,
        });
      } catch (cfError: any) {
        console.error("Cashfree error:", cfError?.response?.data || cfError);
        res.json({ ...order, paymentSessionId: null });
      }
    } catch (error) {
      console.error("Buy now error:", error);
      res.status(500).json({ message: "Failed to process order" });
    }
  });

  app.post("/api/payments/verify", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId, cfOrderId } = req.body;
      if (!orderId || !cfOrderId) {
        return res.status(400).json({ message: "Missing order information" });
      }

      const userId = getUserId(req);
      const order = await storage.getOrderById(Number(orderId));
      if (!order) return res.status(404).json({ message: "Order not found" });

      if (order.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (order.cashfreeOrderId && order.cashfreeOrderId !== cfOrderId) {
        return res.status(400).json({ message: "Order ID mismatch" });
      }

      const storedCfOrderId = order.cashfreeOrderId || cfOrderId;

      const clientId = process.env.CASHFREE_APP_ID;
      const clientSecret = process.env.CASHFREE_SECRET_KEY;
      if (!clientId || !clientSecret) {
        return res.status(500).json({ message: "Payment gateway not configured" });
      }

      const cashfree = getCashfreeInstance();

      const cfResponse = await cashfree.PGFetchOrder(storedCfOrderId);
      const cfStatus = cfResponse.data.order_status;

      let paymentStatus = "pending";
      let orderStatus = "pending";

      if (cfStatus === "PAID") {
        paymentStatus = "paid";
        orderStatus = "confirmed";
      } else if (cfStatus === "ACTIVE") {
        paymentStatus = "pending";
        orderStatus = "pending";
      } else {
        paymentStatus = "failed";
        orderStatus = "cancelled";
      }

      await storage.updateOrderPayment(order.id, { paymentStatus });
      if (orderStatus !== "pending") {
        await storage.updateOrderStatus(order.id, orderStatus);
      }

      if (paymentStatus === "paid" && orderStatus === "confirmed") {
        const user = await authStorage.getUser(order.userId);
        if (user?.email) {
          sendOrderConfirmation(user.email, order as any).catch(err => console.error("Order confirmation email error:", err));
        }
        const updatedOrder = await storage.getOrderById(order.id);
        if (updatedOrder) {
          sendOrderNotification(updatedOrder as any).catch(err => console.error("WhatsApp order notification error:", err));
        }
      }

      res.json({ paymentStatus, orderStatus, cfStatus });
    } catch (error: any) {
      console.error("Payment verify error:", error?.response?.data || error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  app.post("/api/payments/verify-razorpay", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
      if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return res.status(400).json({ message: "Missing payment information" });
      }

      const userId = getUserId(req);
      const order = await storage.getOrderById(Number(orderId));
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
        return res.status(400).json({ message: "Razorpay order ID mismatch" });
      }

      const ps = await storage.getPaymentSettings();
      if (!ps.razorpayKeySecret) {
        return res.status(500).json({ message: "Razorpay not configured" });
      }

      const expectedSignature = crypto
        .createHmac("sha256", ps.razorpayKeySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (expectedSignature === razorpaySignature) {
        await storage.updateOrderPayment(order.id, { paymentStatus: "paid" });
        await storage.updateOrderStatus(order.id, "confirmed");
        await db.update(ordersTable).set({ razorpayOrderId }).where(eq(ordersTable.id, order.id));

        const user = await authStorage.getUser(order.userId);
        if (user?.email) {
          sendOrderConfirmation(user.email, order as any).catch(err => console.error("Order confirmation email error:", err));
        }
        const updatedOrder = await storage.getOrderById(order.id);
        if (updatedOrder) {
          sendOrderNotification(updatedOrder as any).catch(err => console.error("WhatsApp order notification error:", err));
        }

        res.json({ paymentStatus: "paid", orderStatus: "confirmed" });
      } else {
        await storage.updateOrderPayment(order.id, { paymentStatus: "failed" });
        await storage.updateOrderStatus(order.id, "cancelled");
        res.json({ paymentStatus: "failed", orderStatus: "cancelled" });
      }
    } catch (error: any) {
      console.error("Razorpay verify error:", error);
      res.status(500).json({ message: "Failed to verify Razorpay payment" });
    }
  });

  app.get("/api/payment-settings/active", async (_req, res) => {
    try {
      const ps = await storage.getPaymentSettings();
      res.json({
        cashfreeEnabled: ps.cashfreeEnabled,
        razorpayEnabled: ps.razorpayEnabled,
        codEnabled: ps.codEnabled,
      });
    } catch {
      res.json({ cashfreeEnabled: true, razorpayEnabled: false, codEnabled: false });
    }
  });

  app.get("/api/admin/payment-settings", isAuthenticated, requirePermission("manage_products"), async (_req, res) => {
    try {
      const ps = await storage.getPaymentSettings();
      res.json(ps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment settings" });
    }
  });

  app.put("/api/admin/payment-settings", isAuthenticated, requirePermission("manage_products"), async (req, res) => {
    try {
      const updated = await storage.updatePaymentSettings(req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment settings" });
    }
  });

  app.post("/api/coupons/apply", isAuthenticated, async (req: any, res) => {
    try {
      const { code, subtotal } = req.body;
      if (!code || typeof subtotal !== "number") {
        return res.status(400).json({ valid: false, message: "Invalid request" });
      }
      const coupon = await storage.getCouponByCode(code);
      if (!coupon) {
        return res.json({ valid: false, message: "Coupon not found" });
      }
      if (!coupon.isActive) {
        return res.json({ valid: false, message: "This coupon is no longer active" });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.json({ valid: false, message: "This coupon has expired" });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.json({ valid: false, message: "This coupon has reached its usage limit" });
      }
      if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
        return res.json({ valid: false, message: `Minimum order amount is Rs. ${Number(coupon.minOrderAmount).toLocaleString("en-IN")}` });
      }

      let discount = 0;
      const shippingCharge = subtotal >= 1000 ? 0 : 80;
      if (coupon.discountType === "free_shipping") {
        discount = shippingCharge;
      } else if (coupon.discountType === "percentage") {
        discount = Math.round((subtotal * Number(coupon.discountValue)) / 100);
        if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
          discount = Number(coupon.maxDiscount);
        }
      } else {
        discount = Number(coupon.discountValue);
      }
      discount = Math.min(discount, subtotal + shippingCharge);

      res.json({ valid: true, code: coupon.code, discount, discountType: coupon.discountType });
    } catch (error) {
      console.error("Coupon apply error:", error);
      res.status(500).json({ valid: false, message: "Failed to apply coupon" });
    }
  });

  app.get("/api/admin/products", isAuthenticated, requirePermission("manage_products"), async (_req, res) => {
    try {
      const prods = await storage.getProducts();
      res.json(prods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", isAuthenticated, requirePermission("manage_products"), async (req, res) => {
    try {
      const parsed = productSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid product data", errors: parsed.error.flatten() });
      }
      const product = await storage.createProduct(parsed.data);
      res.json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/admin/products/:id", isAuthenticated, requirePermission("manage_products"), async (req, res) => {
    try {
      const parsed = productSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid product data", errors: parsed.error.flatten() });
      }
      const id = parseInt(req.params.id as string);
      const product = await storage.updateProduct(id, parsed.data);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", isAuthenticated, requirePermission("manage_products"), async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get("/api/admin/orders", isAuthenticated, requirePermission("view_orders"), async (_req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      const allUsers = await storage.getAllUsers();
      const userMap = new Map(allUsers.map((u: any) => [u.id, u]));
      const ordersWithCustomer = allOrders.map((order) => {
        const user = userMap.get(order.userId);
        return {
          ...order,
          customerName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "Unknown",
          customerEmail: user?.email || "",
        };
      });
      res.json(ordersWithCustomer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id", isAuthenticated, requirePermission("manage_orders"), async (req, res) => {
    try {
      const parsed = updateOrderStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid status", errors: parsed.error.flatten() });
      }
      const id = parseInt(req.params.id as string);
      const order = await storage.updateOrderStatus(id, parsed.data.status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const newStatus = parsed.data.status;
      if (["shipped", "delivered", "cancelled"].includes(newStatus)) {
        const user = await authStorage.getUser(order.userId);
        if (user?.email) {
          sendShippingUpdate(user.email, order as any, newStatus, order.trackingUrl, order.delhiveryWaybill)
            .catch(err => console.error("Shipping update email error:", err));
        }
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.patch("/api/admin/orders/:id/package", isAuthenticated, requirePermission("manage_orders"), async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
      const { packageLength, packageWidth, packageHeight, packageWeight } = req.body;
      const toNumStr = (v: any): string | null => {
        if (v === "" || v == null) return null;
        const n = Number(v);
        return isNaN(n) || n < 0 ? null : String(n);
      };
      const order = await storage.updateOrderPackage(id, {
        packageLength: toNumStr(packageLength),
        packageWidth: toNumStr(packageWidth),
        packageHeight: toNumStr(packageHeight),
        packageWeight: toNumStr(packageWeight),
      });
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (error) {
      console.error("Update order package error:", error);
      res.status(500).json({ message: "Failed to update package details" });
    }
  });

  app.get("/api/admin/notifications", isAuthenticated, requirePermission("view_dashboard"), async (_req, res) => {
    try {
      const notifications = await storage.getAdminNotifications();
      const unreadCount = await storage.getUnreadNotificationCount();
      res.json({ notifications, unreadCount });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/admin/notifications/mark-read/:id", isAuthenticated, requirePermission("view_dashboard"), async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.markNotificationRead(id);
      res.json({ message: "Marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification read" });
    }
  });

  app.post("/api/admin/notifications/mark-all-read", isAuthenticated, requirePermission("view_dashboard"), async (_req, res) => {
    try {
      await storage.markAllNotificationsRead();
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications read" });
    }
  });

  // Admin stats
  app.get("/api/admin/stats", isAuthenticated, requirePermission("view_dashboard"), async (_req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin customers
  app.get("/api/admin/customers", isAuthenticated, requirePermission("view_customers"), async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const customers = allUsers.filter((user) => user.role === "customer");
      const usersWithOrders = await Promise.all(
        customers.map(async (user) => {
          const orderCount = await storage.getUserOrderCount(user.id);
          return { ...user, orderCount };
        })
      );
      res.json(usersWithOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Admin create customer
  app.post("/api/admin/customers", isAuthenticated, requirePermission("manage_customers"), async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid customer data", errors: parsed.error.flatten() });
      const { email, password, firstName, lastName } = parsed.data;
      const { authStorage } = await import("./replit_integrations/auth/storage");
      const existing = await authStorage.getUserByEmail(email);
      if (existing) return res.status(409).json({ message: "An account with this email already exists" });
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await authStorage.upsertUser({ email, password: hashedPassword, firstName, lastName });
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Admin create customer error:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.get("/api/admin/customers/:id", isAuthenticated, requirePermission("view_customers"), async (req, res) => {
    try {
      const userId = req.params.id as string;
      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ message: "Customer not found" });
      const orderCount = await storage.getUserOrderCount(userId);
      const customerOrders = await storage.getOrdersByUserId(userId);
      const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      res.json({ ...user, orderCount, totalSpent, orders: customerOrders });
    } catch (error) {
      console.error("Admin get customer detail error:", error);
      res.status(500).json({ message: "Failed to fetch customer details" });
    }
  });

  app.patch("/api/admin/customers/:id", isAuthenticated, requirePermission("manage_customers"), async (req, res) => {
    try {
      const userId = req.params.id as string;
      const schema = z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional().nullable(),
        isAdmin: z.boolean().optional(),
        role: z.enum(["super_admin", "manager", "staff", "customer"]).optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      const { authStorage } = await import("./replit_integrations/auth/storage");
      const updated = await authStorage.updateUser(userId, parsed.data);
      if (!updated) return res.status(404).json({ message: "Customer not found" });
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      console.error("Admin update customer error:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Admin categories
  app.post("/api/admin/categories", isAuthenticated, requirePermission("manage_categories"), async (req, res) => {
    try {
      const parsed = insertCategorySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid category data" });
      const cat = await storage.createCategory(parsed.data);
      res.json(cat);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/admin/categories/:id", isAuthenticated, requirePermission("manage_categories"), async (req, res) => {
    try {
      const parsed = insertCategorySchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid category data" });
      const id = parseInt(req.params.id as string);
      const cat = await storage.updateCategory(id, parsed.data);
      if (!cat) return res.status(404).json({ message: "Category not found" });
      res.json(cat);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", isAuthenticated, requirePermission("manage_categories"), async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      await storage.deleteCategory(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Admin coupons
  app.get("/api/admin/coupons", isAuthenticated, requirePermission("manage_coupons"), async (_req, res) => {
    try {
      const allCoupons = await storage.getCoupons();
      res.json(allCoupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.post("/api/admin/coupons", isAuthenticated, requirePermission("manage_coupons"), async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.expiresAt && typeof body.expiresAt === "string") body.expiresAt = new Date(body.expiresAt);
      const parsed = insertCouponSchema.safeParse(body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid coupon data", errors: parsed.error.flatten() });
      const coupon = await storage.createCoupon(parsed.data);
      res.json(coupon);
    } catch (error: any) {
      if (error?.code === "23505") return res.status(409).json({ message: "A coupon with this code already exists" });
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  app.patch("/api/admin/coupons/:id", isAuthenticated, requirePermission("manage_coupons"), async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.expiresAt && typeof body.expiresAt === "string") body.expiresAt = new Date(body.expiresAt);
      const parsed = insertCouponSchema.partial().safeParse(body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid coupon data" });
      const id = parseInt(req.params.id as string);
      const coupon = await storage.updateCoupon(id, parsed.data);
      if (!coupon) return res.status(404).json({ message: "Coupon not found" });
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", isAuthenticated, requirePermission("manage_coupons"), async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      await storage.deleteCoupon(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // Delivery settings (public read for checkout)
  app.get("/api/admin/roles", isAuthenticated, requirePermission("manage_roles"), async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const staffUsers = allUsers.filter((u: any) => {
        const role = u.role || (u.isAdmin ? "super_admin" : "customer");
        return role !== "customer";
      });
      res.json(staffUsers.map((u: any) => {
        const { password: _, ...safe } = u;
        return { ...safe, role: u.role || (u.isAdmin ? "super_admin" : "customer") };
      }));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.patch("/api/admin/roles/:id", isAuthenticated, requirePermission("manage_roles"), async (req, res) => {
    try {
      const userId = req.params.id as string;
      const schema = z.object({
        role: z.enum(["super_admin", "manager", "staff", "customer"]),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid role" });
      const isAdminValue = parsed.data.role !== "customer";
      const updated = await authStorage.updateUser(userId, { role: parsed.data.role, isAdmin: isAdminValue });
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      console.error("Update role error:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.post("/api/admin/email/send", isAuthenticated, requirePermission("manage_customers"), async (req, res) => {
    try {
      const schema = z.object({
        subject: z.string().min(1),
        heading: z.string().min(1),
        body: z.string().min(1),
        ctaText: z.string().optional(),
        ctaUrl: z.string().url().optional(),
        recipients: z.enum(["all", "selected"]),
        selectedEmails: z.array(z.string().email()).optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid email data", errors: parsed.error.flatten() });

      let emails: string[] = [];
      if (parsed.data.recipients === "all") {
        const allUsers = await storage.getAllUsers();
        emails = allUsers.map((u: any) => u.email).filter((e: string) => e && e.includes("@"));
      } else {
        emails = (parsed.data.selectedEmails || []).filter((e: string) => e && e.includes("@"));
      }

      if (emails.length === 0) return res.status(400).json({ message: "No recipients found" });

      const results = await sendPromotionalEmail(
        emails,
        parsed.data.subject,
        parsed.data.heading,
        parsed.data.body,
        parsed.data.ctaText,
        parsed.data.ctaUrl,
      );
      res.json({ sent: results.length, results });
    } catch (error) {
      console.error("Send promotional email error:", error);
      res.status(500).json({ message: "Failed to send emails" });
    }
  });

  app.get("/api/delivery-settings", async (_req, res) => {
    try {
      const settings = await storage.getDeliverySettings();
      if (!settings) {
        return res.json({ freeDeliveryEnabled: true, flatDeliveryCharge: "0", freeDeliveryThreshold: null });
      }
      res.json({
        freeDeliveryEnabled: settings.freeDeliveryEnabled,
        flatDeliveryCharge: settings.flatDeliveryCharge,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch delivery settings" });
    }
  });

  // Admin delivery settings
  app.get("/api/admin/delivery-settings", isAuthenticated, requirePermission("manage_delivery"), async (_req, res) => {
    try {
      const settings = await storage.getDeliverySettings();
      res.json(settings || {
        freeDeliveryEnabled: true,
        flatDeliveryCharge: "0",
        freeDeliveryThreshold: null,
        perKgCharge: "0",
        delhiveryApiToken: "",
        delhiveryWarehouseName: "",
        delhiveryPickupPincode: "",
        delhiveryPickupAddress: "",
        delhiveryPickupCity: "",
        delhiveryPickupState: "",
        delhiveryPickupPhone: "",
        delhiveryEnvironment: "staging",
        sellerName: "",
        sellerGstTin: "",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch delivery settings" });
    }
  });

  app.put("/api/admin/delivery-settings", isAuthenticated, requirePermission("manage_delivery"), async (req, res) => {
    try {
      const settings = await storage.upsertDeliverySettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Update delivery settings error:", error);
      res.status(500).json({ message: "Failed to update delivery settings" });
    }
  });

  function getDelhiveryBaseUrl(env: string | null | undefined) {
    return env === "production" ? "https://track.delhivery.com" : "https://staging-express.delhivery.com";
  }

  // Delhivery integration routes
  app.post("/api/admin/delhivery/check-pincode", isAuthenticated, requirePermission("manage_delivery"), async (req, res) => {
    try {
      const { pincode } = req.body;
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.status(400).json({ message: "Delhivery API token not configured" });
      }
      const baseUrl = settings.delhiveryEnvironment === "production"
        ? "https://track.delhivery.com"
        : "https://staging-express.delhivery.com";
      const response = await fetch(`${baseUrl}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
        headers: { Authorization: `Token ${settings.delhiveryApiToken}`, "Content-Type": "application/json" },
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Delhivery pincode check error:", error);
      res.status(500).json({ message: "Failed to check pincode serviceability" });
    }
  });

  app.post("/api/delhivery/check-pincode", isAuthenticated, async (req, res) => {
    try {
      const { pincode } = req.body;
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.json({ serviceable: true });
      }
      const baseUrl = settings.delhiveryEnvironment === "production"
        ? "https://track.delhivery.com"
        : "https://staging-express.delhivery.com";
      const response = await fetch(`${baseUrl}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
        headers: { Authorization: `Token ${settings.delhiveryApiToken}`, "Content-Type": "application/json" },
      });
      const data = await response.json();
      const serviceable = data?.delivery_codes?.length > 0;
      res.json({ serviceable, data: data?.delivery_codes?.[0]?.postal_code || null });
    } catch (error) {
      res.json({ serviceable: true });
    }
  });

  app.post("/api/admin/delhivery/create-shipment", isAuthenticated, requirePermission("manage_orders"), async (req, res) => {
    try {
      const { orderId } = req.body;
      const order = await storage.getOrderById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.status(400).json({ message: "Delhivery API token not configured" });
      }
      const shipping = order.shippingAddress as any;
      const items = order.items as any[];
      const baseUrl = settings.delhiveryEnvironment === "production"
        ? "https://track.delhivery.com"
        : "https://staging-express.delhivery.com";

      const customerName = shipping.fullName || `${shipping.firstName || ""} ${shipping.lastName || ""}`.trim() || "Customer";
      const pickupName = settings.delhiveryWarehouseName || "default";

      const totalWeightGrams = items.reduce((sum: number, i: any) => sum + ((i.weight || 0) * (i.quantity || 1)), 0);
      const totalWeightKg = totalWeightGrams > 0 ? (totalWeightGrams / 1000) : 0.5;

      const shipmentData = {
        shipments: [{
          name: customerName,
          add: shipping.address,
          pin: shipping.pincode,
          city: shipping.city,
          state: shipping.state,
          country: "India",
          phone: shipping.phone,
          order: `RVN-${order.id}`,
          payment_mode: "Prepaid",
          return_pin: settings.delhiveryPickupPincode || "",
          return_city: settings.delhiveryPickupCity || "",
          return_phone: settings.delhiveryPickupPhone || "",
          return_add: settings.delhiveryPickupAddress || "",
          return_state: settings.delhiveryPickupState || "",
          return_country: "India",
          products_desc: items.map((i: any) => i.name).join(", "),
          cod_amount: "0",
          order_date: new Date().toISOString().split("T")[0],
          total_amount: String(order.totalAmount),
          seller_add: settings.delhiveryPickupAddress || "",
          seller_name: settings.sellerName || "Ravindrra Vastra Niketan",
          seller_inv: `INV-${order.id}`,
          quantity: String(items.reduce((s: number, i: any) => s + (i.quantity || 1), 0)),
          weight: String(totalWeightKg),
          waybill: "",
          shipping_mode: "Surface",
          address_type: "home",
        }],
        pickup_location: { name: pickupName },
      };

      const formBody = `format=json&data=${encodeURIComponent(JSON.stringify(shipmentData))}`;

      const response = await fetch(`${baseUrl}/api/cmu/create.json`, {
        method: "POST",
        headers: {
          Authorization: `Token ${settings.delhiveryApiToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      });
      const result = await response.json();

      if (result?.packages?.[0]?.waybill) {
        const waybill = result.packages[0].waybill;
        const trackingUrl = `https://www.delhivery.com/track/package/${waybill}`;
        await storage.updateOrderTracking(order.id, {
          delhiveryWaybill: waybill,
          delhiveryStatus: "Manifested",
          trackingUrl,
        });
        await storage.updateOrderStatus(order.id, "shipped");

        const user = await authStorage.getUser(order.userId);
        if (user?.email) {
          sendShippingUpdate(user.email, order as any, "shipped", trackingUrl, waybill)
            .catch(err => console.error("Shipping email error:", err));
        }

        res.json({ success: true, waybill, trackingUrl, result });
      } else {
        res.json({ success: false, result });
      }
    } catch (error) {
      console.error("Delhivery shipment creation error:", error);
      res.status(500).json({ message: "Failed to create shipment" });
    }
  });

  app.get("/api/admin/delhivery/track/:waybill", isAuthenticated, requirePermission("view_orders"), async (req, res) => {
    try {
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.status(400).json({ message: "Delhivery API token not configured" });
      }
      const baseUrl = settings.delhiveryEnvironment === "production"
        ? "https://track.delhivery.com"
        : "https://staging-express.delhivery.com";
      const response = await fetch(`${baseUrl}/api/v1/packages/json/?waybill=${req.params.waybill}`, {
        headers: { Authorization: `Token ${settings.delhiveryApiToken}`, "Content-Type": "application/json" },
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Delhivery tracking error:", error);
      res.status(500).json({ message: "Failed to track shipment" });
    }
  });

  app.get("/api/orders/:id/track", isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrderById(Number(req.params.id));
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.userId !== (req as any).userId) return res.status(403).json({ message: "Forbidden" });
      if (!order.delhiveryWaybill) {
        return res.json({ tracking: null, message: "No tracking info available yet" });
      }
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.json({ waybill: order.delhiveryWaybill, trackingUrl: order.trackingUrl, status: order.delhiveryStatus });
      }
      const baseUrl = settings.delhiveryEnvironment === "production"
        ? "https://track.delhivery.com"
        : "https://staging-express.delhivery.com";
      try {
        const response = await fetch(`${baseUrl}/api/v1/packages/json/?waybill=${order.delhiveryWaybill}`, {
          headers: { Authorization: `Token ${settings.delhiveryApiToken}`, "Content-Type": "application/json" },
        });
        const data = await response.json();
        const latestStatus = data?.ShipmentData?.[0]?.Shipment?.Status?.Status || order.delhiveryStatus;
        if (latestStatus && latestStatus !== order.delhiveryStatus) {
          await storage.updateOrderTracking(order.id, { delhiveryStatus: latestStatus });
        }
        res.json({ waybill: order.delhiveryWaybill, trackingUrl: order.trackingUrl, status: latestStatus, details: data });
      } catch {
        res.json({ waybill: order.delhiveryWaybill, trackingUrl: order.trackingUrl, status: order.delhiveryStatus });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get tracking info" });
    }
  });

  // Calculate shipping cost via Delhivery
  app.post("/api/delhivery/shipping-cost", isAuthenticated, async (req, res) => {
    try {
      const { originPincode, destinationPincode, weight, mode, paymentType, codAmount } = req.body;
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.json({ available: false, message: "Shipping cost calculator not configured" });
      }
      const baseUrl = getDelhiveryBaseUrl(settings.delhiveryEnvironment);
      const params = new URLSearchParams({
        md: mode || "S",
        cgm: String(weight || 0.5),
        o_pin: originPincode || settings.delhiveryPickupPincode || "",
        d_pin: destinationPincode,
        ss: "Delivered",
        pt: paymentType || "Pre-paid",
      });
      if (codAmount) params.append("cod", String(codAmount));
      const response = await fetch(`${baseUrl}/api/kinko/v1/invoice/charges/.json?${params.toString()}`, {
        headers: { Authorization: `Token ${settings.delhiveryApiToken}` },
      });
      const data = await response.json();
      res.json({ available: true, ...data });
    } catch (error) {
      console.error("Delhivery shipping cost error:", error);
      res.status(500).json({ message: "Failed to calculate shipping cost" });
    }
  });

  // Admin: Calculate shipping cost
  app.post("/api/admin/delhivery/shipping-cost", isAuthenticated, requirePermission("manage_delivery"), async (req, res) => {
    try {
      const { originPincode, destinationPincode, weight, mode, paymentType, codAmount } = req.body;
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.status(400).json({ message: "Delhivery API token not configured" });
      }
      const baseUrl = getDelhiveryBaseUrl(settings.delhiveryEnvironment);
      const params = new URLSearchParams({
        md: mode || "S",
        cgm: String(weight || 0.5),
        o_pin: originPincode || settings.delhiveryPickupPincode || "",
        d_pin: destinationPincode,
        ss: "Delivered",
        pt: paymentType || "Pre-paid",
      });
      if (codAmount) params.append("cod", String(codAmount));
      const response = await fetch(`${baseUrl}/api/kinko/v1/invoice/charges/.json?${params.toString()}`, {
        headers: { Authorization: `Token ${settings.delhiveryApiToken}` },
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Delhivery shipping cost error:", error);
      res.status(500).json({ message: "Failed to calculate shipping cost" });
    }
  });

  // Admin: Cancel shipment
  app.post("/api/admin/delhivery/cancel-shipment", isAuthenticated, requirePermission("manage_orders"), async (req, res) => {
    try {
      const { orderId, waybill } = req.body;
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.status(400).json({ message: "Delhivery API token not configured" });
      }
      const baseUrl = getDelhiveryBaseUrl(settings.delhiveryEnvironment);
      const response = await fetch(`${baseUrl}/api/p/edit`, {
        method: "POST",
        headers: {
          Authorization: `Token ${settings.delhiveryApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ waybill, cancellation: true }),
      });
      const data = await response.json();
      if (orderId) {
        await storage.updateOrderTracking(Number(orderId), { delhiveryStatus: "Cancelled" });
        await storage.updateOrderStatus(Number(orderId), "cancelled");
      }
      res.json({ success: true, data });
    } catch (error) {
      console.error("Delhivery cancel shipment error:", error);
      res.status(500).json({ message: "Failed to cancel shipment" });
    }
  });

  // Admin: Create pickup request
  app.post("/api/admin/delhivery/pickup-request", isAuthenticated, requirePermission("manage_delivery"), async (req, res) => {
    try {
      const { pickupDate, pickupTime, packageCount } = req.body;
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.status(400).json({ message: "Delhivery API token not configured" });
      }
      const baseUrl = getDelhiveryBaseUrl(settings.delhiveryEnvironment);
      const response = await fetch(`${baseUrl}/fm/request/new/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${settings.delhiveryApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickup_time: pickupTime || "12:00:00",
          pickup_date: pickupDate || new Date().toISOString().split("T")[0],
          pickup_location: settings.delhiveryWarehouseName || "default",
          expected_package_count: packageCount || 1,
        }),
      });
      const data = await response.json();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Delhivery pickup request error:", error);
      res.status(500).json({ message: "Failed to create pickup request" });
    }
  });

  // Admin: Fetch waybill numbers
  app.post("/api/admin/delhivery/fetch-waybill", isAuthenticated, requirePermission("manage_delivery"), async (req, res) => {
    try {
      const { count } = req.body;
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.status(400).json({ message: "Delhivery API token not configured" });
      }
      const baseUrl = getDelhiveryBaseUrl(settings.delhiveryEnvironment);
      const clientName = settings.sellerName || "Ravindrra Vastra Niketan";
      const response = await fetch(`${baseUrl}/waybill/api/bulk/json/?count=${count || 1}&cl=${encodeURIComponent(clientName)}`, {
        headers: { Authorization: `Token ${settings.delhiveryApiToken}` },
      });
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch {
        res.json({ waybills: text.split(",").map((w: string) => w.trim()).filter(Boolean) });
      }
    } catch (error) {
      console.error("Delhivery waybill fetch error:", error);
      res.status(500).json({ message: "Failed to fetch waybills" });
    }
  });

  // Admin: Generate shipping label (packing slip)
  app.get("/api/admin/delhivery/label/:waybill", isAuthenticated, requirePermission("manage_orders"), async (req, res) => {
    try {
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.status(400).json({ message: "Delhivery API token not configured" });
      }
      const baseUrl = getDelhiveryBaseUrl(settings.delhiveryEnvironment);
      const response = await fetch(`${baseUrl}/api/p/packing_slip?wbns=${req.params.waybill}&pdf=true`, {
        headers: { Authorization: `Token ${settings.delhiveryApiToken}` },
      });
      if (response.headers.get("content-type")?.includes("application/pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="label-${req.params.waybill}.pdf"`);
        const buffer = Buffer.from(await response.arrayBuffer());
        res.send(buffer);
      } else {
        const data = await response.json();
        res.json(data);
      }
    } catch (error) {
      console.error("Delhivery label error:", error);
      res.status(500).json({ message: "Failed to generate shipping label" });
    }
  });

  // Admin: Create/register warehouse
  app.post("/api/admin/delhivery/create-warehouse", isAuthenticated, requirePermission("manage_delivery"), async (req, res) => {
    try {
      const settings = await storage.getDeliverySettings();
      if (!settings?.delhiveryApiToken) {
        return res.status(400).json({ message: "Delhivery API token not configured" });
      }
      const baseUrl = getDelhiveryBaseUrl(settings.delhiveryEnvironment);
      const response = await fetch(`${baseUrl}/api/backend/clientwarehouse/create/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${settings.delhiveryApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: settings.delhiveryWarehouseName || "default",
          phone: settings.delhiveryPickupPhone || "",
          address: settings.delhiveryPickupAddress || "",
          city: settings.delhiveryPickupCity || "",
          state: settings.delhiveryPickupState || "",
          pin: settings.delhiveryPickupPincode || "",
          country: "India",
          registered_name: settings.sellerName || "Ravindrra Vastra Niketan",
          return_address: settings.delhiveryPickupAddress || "",
          return_pin: settings.delhiveryPickupPincode || "",
          return_city: settings.delhiveryPickupCity || "",
          return_state: settings.delhiveryPickupState || "",
          return_country: "India",
        }),
      });
      const data = await response.json();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Delhivery warehouse creation error:", error);
      res.status(500).json({ message: "Failed to create warehouse" });
    }
  });

  // ====================== RETURN REQUESTS ======================

  const RETURN_WINDOW_DAYS = 2;

  app.post("/api/orders/:id/return", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const orderId = Number(req.params.id);
      const schema = z.object({
        reason: z.string().min(5, "Please provide a reason (at least 5 characters)"),
        damageVideoUrl: z.string().min(1, "Please upload a video of the damaged item"),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Please provide a reason and upload a damage video", errors: parsed.error.flatten() });

      const order = await storage.getOrderById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      if (order.status !== "delivered") return res.status(400).json({ message: "Only delivered orders can be returned" });

      const existing = await storage.getReturnRequestByOrderId(orderId);
      if (existing) return res.status(400).json({ message: "A return request already exists for this order" });

      const deliveredAt = order.updatedAt || order.createdAt;
      if (deliveredAt) {
        const daysSinceDelivery = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
          return res.status(400).json({ message: `Return window has expired. Returns must be requested within ${RETURN_WINDOW_DAYS} days of delivery.` });
        }
      }

      const returnReq = await storage.createReturnRequest({
        orderId,
        userId,
        reason: parsed.data.reason,
        damageVideoUrl: parsed.data.damageVideoUrl,
        status: "pending",
      });

      const user = await authStorage.getUser(userId);
      if (user?.email) {
        sendReturnRequestEmail(user.email, orderId, "pending").catch(() => {});
      }

      res.json(returnReq);
    } catch (error) {
      console.error("Return request error:", error);
      res.status(500).json({ message: "Failed to submit return request" });
    }
  });

  app.get("/api/returns", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const returns = await storage.getReturnRequestsByUser(userId);
      res.json(returns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch return requests" });
    }
  });

  app.get("/api/orders/:id/return-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const orderId = Number(req.params.id);
      const order = await storage.getOrderById(orderId);
      if (!order || order.userId !== userId) return res.status(404).json({ returnRequest: null });
      const returnReq = await storage.getReturnRequestByOrderId(orderId);
      res.json({ returnRequest: returnReq || null });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch return status" });
    }
  });

  app.get("/api/admin/returns", isAuthenticated, requirePermission("manage_orders"), async (req, res) => {
    try {
      const returns = await storage.getAllReturnRequests();
      const enriched = await Promise.all(returns.map(async (r) => {
        const order = await storage.getOrderById(r.orderId);
        const user = await authStorage.getUser(r.userId);
        return {
          ...r,
          order: order ? { id: order.id, totalAmount: order.totalAmount, items: order.items, status: order.status } : null,
          customerName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown",
          customerEmail: user?.email || "",
        };
      }));
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch return requests" });
    }
  });

  app.patch("/api/admin/returns/:id", isAuthenticated, requirePermission("manage_orders"), async (req, res) => {
    try {
      const id = Number(req.params.id);
      const schema = z.object({
        status: z.enum(["approved", "rejected"]),
        adminNotes: z.string().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });

      const updated = await storage.updateReturnRequest(id, parsed.data);
      if (!updated) return res.status(404).json({ message: "Return request not found" });

      if (parsed.data.status === "approved") {
        await storage.updateOrderStatus(updated.orderId, "returned");
      }

      const user = await authStorage.getUser(updated.userId);
      if (user?.email) {
        sendReturnRequestEmail(user.email, updated.orderId, parsed.data.status, parsed.data.adminNotes).catch(() => {});
      }

      res.json(updated);
    } catch (error) {
      console.error("Update return request error:", error);
      res.status(500).json({ message: "Failed to update return request" });
    }
  });

  app.get("/api/products/:productId/reviews", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId as string);
      if (isNaN(productId)) return res.status(400).json({ message: "Invalid product ID" });
      const reviewsList = await storage.getReviewsByProductId(productId);
      const rating = await storage.getProductAverageRating(productId);
      res.json({ reviews: reviewsList, average: rating.average, count: rating.count });
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ message: "Failed to get reviews" });
    }
  });

  app.post("/api/products/:productId/reviews", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const productId = parseInt(req.params.productId as string);
      if (isNaN(productId)) return res.status(400).json({ message: "Invalid product ID" });

      const product = await storage.getProductById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const existing = await storage.getReviewByUserAndProduct(userId, productId);
      if (existing) return res.status(400).json({ message: "You have already reviewed this product" });

      const schema = z.object({
        rating: z.number().min(1).max(5),
        title: z.string().max(200).optional(),
        comment: z.string().max(2000).optional(),
        images: z.array(z.string()).default([]),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid review data", errors: parsed.error.flatten() });

      const review = await storage.createReview({
        productId,
        userId,
        rating: parsed.data.rating,
        title: parsed.data.title || null,
        comment: parsed.data.comment || null,
        images: parsed.data.images,
      });
      res.status(201).json(review);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.delete("/api/reviews/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid review ID" });
      await storage.deleteReview(id, userId);
      res.json({ message: "Review deleted" });
    } catch (error) {
      console.error("Delete review error:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // ===== Order Tracking =====
  app.get("/api/track-order/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) return res.status(400).json({ message: "Invalid order ID" });
      const order = await storage.getOrderById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const trackingInfo: any = {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        delhiveryWaybill: order.delhiveryWaybill,
        delhiveryStatus: order.delhiveryStatus,
        trackingUrl: order.trackingUrl,
        items: order.items,
      };

      if (order.delhiveryWaybill) {
        try {
          const settings = await storage.getDeliverySettings();
          if (settings?.delhiveryApiToken) {
            const baseUrl = settings.delhiveryEnvironment === "production"
              ? "https://track.delhivery.com" : "https://staging-express.delhivery.com";
            const trackRes = await fetch(`${baseUrl}/api/v1/packages/json/?waybill=${order.delhiveryWaybill}`, {
              headers: { Authorization: `Token ${settings.delhiveryApiToken}` },
            });
            if (trackRes.ok) {
              const trackData = await trackRes.json();
              trackingInfo.delhiveryTracking = trackData?.ShipmentData?.[0]?.Shipment;
            }
          }
        } catch (e) {
          console.error("Delhivery tracking fetch error:", e);
        }
      }

      res.json(trackingInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to track order" });
    }
  });

  // ===== Newsletter =====
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const schema = z.object({ email: z.string().email() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Valid email required" });
      const sub = await storage.addNewsletterSubscriber({ email: parsed.data.email });
      res.status(201).json(sub);
    } catch (error: any) {
      if (error?.code === '23505') return res.status(409).json({ message: "Already subscribed" });
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });

  app.get("/api/admin/newsletter", isAuthenticated, requirePermission("manage_customers"), async (_req, res) => {
    try {
      const subs = await storage.getNewsletterSubscribers();
      res.json(subs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  app.delete("/api/admin/newsletter/:id", isAuthenticated, requirePermission("manage_customers"), async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteNewsletterSubscriber(id);
      res.json({ message: "Subscriber removed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove subscriber" });
    }
  });

  // ===== Instagram Posts =====
  app.get("/api/instagram-posts", async (_req, res) => {
    try {
      const posts = await storage.getInstagramPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/admin/instagram-posts", isAuthenticated, requirePermission("manage_products"), async (req, res) => {
    try {
      const schema = z.object({
        imageUrl: z.string().url(),
        postUrl: z.string().url(),
        caption: z.string().optional(),
        sortOrder: z.number().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
      const post = await storage.createInstagramPost({
        imageUrl: parsed.data.imageUrl,
        postUrl: parsed.data.postUrl,
        caption: parsed.data.caption || null,
        sortOrder: parsed.data.sortOrder || 0,
      });
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.delete("/api/admin/instagram-posts/:id", isAuthenticated, requirePermission("manage_products"), async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteInstagramPost(id);
      res.json({ message: "Post deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // ===== Contact Messages =====
  app.post("/api/contact", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        subject: z.string().min(1),
        message: z.string().min(1),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "All fields required" });
      const msg = await storage.createContactMessage({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
      });
      res.status(201).json(msg);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/admin/contact-messages", isAuthenticated, requirePermission("view_customers"), async (_req, res) => {
    try {
      const msgs = await storage.getContactMessages();
      res.json(msgs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.patch("/api/admin/contact-messages/:id/read", isAuthenticated, requirePermission("view_customers"), async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.markContactMessageRead(id);
      res.json({ message: "Marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update" });
    }
  });

  // ===== Flash Sale Products =====
  app.get("/api/flash-sale", async (_req, res) => {
    try {
      const products = await storage.getFlashSaleProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flash sale products" });
    }
  });

  // ===== Sales Analytics =====
  app.get("/api/admin/analytics", isAuthenticated, requirePermission("view_dashboard"), async (_req, res) => {
    try {
      const analytics = await storage.getSalesAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ===== Wishlist =====
  app.get("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const items = await storage.getWishlist(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.get("/api/wishlist/check/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const productId = parseInt(req.params.productId as string);
      if (isNaN(productId)) return res.status(400).json({ message: "Invalid product ID" });
      const inWishlist = await storage.isInWishlist(userId, productId);
      res.json({ inWishlist });
    } catch (error) {
      res.status(500).json({ message: "Failed to check wishlist" });
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ message: "Product ID required" });
      const item = await storage.addToWishlist({ userId, productId });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const productId = parseInt(req.params.productId as string);
      if (isNaN(productId)) return res.status(400).json({ message: "Invalid product ID" });
      await storage.removeFromWishlist(userId, productId);
      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // ===== Seasonal Banners =====
  app.get("/api/banners", async (_req, res) => {
    try {
      const banners = await storage.getActiveBanners();
      res.json(banners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  app.get("/api/admin/banners", isAuthenticated, requirePermission("manage_products"), async (_req, res) => {
    try {
      const banners = await storage.getAllBanners();
      res.json(banners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  app.post("/api/admin/banners", isAuthenticated, requirePermission("manage_products"), async (req, res) => {
    try {
      const banner = await storage.createBanner(req.body);
      res.status(201).json(banner);
    } catch (error) {
      res.status(500).json({ message: "Failed to create banner" });
    }
  });

  app.patch("/api/admin/banners/:id", isAuthenticated, requirePermission("manage_products"), async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const banner = await storage.updateBanner(id, req.body);
      res.json(banner);
    } catch (error) {
      res.status(500).json({ message: "Failed to update banner" });
    }
  });

  app.delete("/api/admin/banners/:id", isAuthenticated, requirePermission("manage_products"), async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteBanner(id);
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete banner" });
    }
  });

  // ===== Enhanced Admin Stats =====
  app.get("/api/admin/enhanced-stats", isAuthenticated, requirePermission("view_dashboard"), async (_req, res) => {
    try {
      const stats = await storage.getEnhancedStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enhanced stats" });
    }
  });

  // ===== Abandoned Cart Email Trigger (admin) =====
  app.post("/api/admin/send-abandoned-cart-emails", isAuthenticated, requirePermission("manage_orders"), async (_req, res) => {
    try {
      const carts = await storage.getAbandonedCartsForEmail(2);
      let sent = 0;
      for (const cart of carts) {
        const alreadySent = await storage.wasAbandonedCartEmailSent(cart.userId, 24);
        if (alreadySent) continue;
        try {
          await sendPromotionalEmail(
            [cart.email],
            "You left something behind! Complete your purchase",
            `<div style="font-family: 'Raleway', sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #2C3E50; padding: 30px; text-align: center;">
                <h1 style="color: #C9A961; font-family: 'Playfair Display', serif; margin: 0;">Ravindrra Vastra Niketan</h1>
              </div>
              <div style="padding: 30px; background: #fff;">
                <h2 style="color: #2C3E50;">Don't forget your items!</h2>
                <p style="color: #666;">You have items worth <strong>Rs. ${Number(cart.totalValue).toLocaleString("en-IN")}</strong> waiting in your cart.</p>
                <div style="margin: 20px 0;">
                  ${cart.items.map(i => `<div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                    ${i.imageUrl ? `<img src="${i.imageUrl}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 12px;" />` : ''}
                    <div><p style="margin: 0; font-weight: 600;">${i.name}</p><p style="margin: 4px 0 0; color: #666;">Qty: ${i.quantity} × Rs. ${Number(i.price).toLocaleString("en-IN")}</p></div>
                  </div>`).join('')}
                </div>
                <a href="https://ravindrra.com/cart" style="display: inline-block; background: #C9A961; color: #1A1A1A; padding: 12px 30px; text-decoration: none; font-weight: 600; border-radius: 4px;">Complete Your Purchase</a>
              </div>
            </div>`
          );
          await storage.recordAbandonedCartEmail(cart.userId, cart.email, cart.totalValue);
          sent++;
        } catch (e) {
          console.error("Failed to send abandoned cart email to", cart.email, e);
        }
      }
      res.json({ message: `Sent ${sent} abandoned cart reminder emails`, sent, total: carts.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to send abandoned cart emails" });
    }
  });

  return httpServer;
}
