import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { authStorage } from "./replit_integrations/auth/storage";
import { Cashfree as CashfreeSDK, CFEnvironment } from "cashfree-pg";

function getCashfreeInstance() {
  const clientId = process.env.CASHFREE_APP_ID || "";
  const clientSecret = process.env.CASHFREE_SECRET_KEY || "";
  const env = process.env.CASHFREE_ENV === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  return new (CashfreeSDK as any)(env, clientId, clientSecret);
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
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
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
      }));

      const totalAmount = cartItemsData
        .reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
        .toFixed(2);

      const subtotal = Number(totalAmount);
      const shipping = subtotal > 2999 ? 0 : 199;
      const finalTotal = (subtotal + shipping).toFixed(2);

      const order = await storage.createOrder({
        userId,
        status: "pending",
        totalAmount: finalTotal,
        shippingAddress: parsed.data.shippingAddress,
        items,
        paymentStatus: "pending",
        paymentMethod: "cashfree",
      });

      await storage.clearCart(userId);

      const clientId = process.env.CASHFREE_APP_ID;
      const clientSecret = process.env.CASHFREE_SECRET_KEY;

      if (!clientId || !clientSecret) {
        return res.json({ ...order, paymentSessionId: null });
      }

      const user = await authStorage.getUser(userId);
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
        const cfResponse = await cashfree.PGCreateOrder("2023-08-01", cfRequest);
        await storage.updateOrderPayment(order.id, { paymentStatus: "pending", cashfreeOrderId: cfOrderId });
        res.json({
          ...order,
          cashfreeOrderId: cfOrderId,
          paymentSessionId: cfResponse.data.payment_session_id,
        });
      } catch (cfError: any) {
        console.error("Cashfree order creation error:", cfError?.response?.data || cfError);
        res.json({ ...order, paymentSessionId: null, paymentError: "Could not initiate payment" });
      }
    } catch (error) {
      console.error("Order error:", error);
      res.status(500).json({ message: "Failed to create order" });
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

      const cfResponse = await cashfree.PGFetchOrder("2023-08-01", storedCfOrderId);
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

      res.json({ paymentStatus, orderStatus, cfStatus });
    } catch (error: any) {
      console.error("Payment verify error:", error?.response?.data || error);
      res.status(500).json({ message: "Failed to verify payment" });
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
      if (coupon.discountType === "percentage") {
        discount = Math.round((subtotal * Number(coupon.discountValue)) / 100);
        if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
          discount = Number(coupon.maxDiscount);
        }
      } else {
        discount = Number(coupon.discountValue);
      }
      discount = Math.min(discount, subtotal);

      res.json({ valid: true, code: coupon.code, discount });
    } catch (error) {
      console.error("Coupon apply error:", error);
      res.status(500).json({ valid: false, message: "Failed to apply coupon" });
    }
  });

  app.get("/api/admin/products", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const prods = await storage.getProducts();
      res.json(prods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", isAuthenticated, isAdmin, async (req, res) => {
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

  app.patch("/api/admin/products/:id", isAuthenticated, isAdmin, async (req, res) => {
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

  app.delete("/api/admin/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id", isAuthenticated, isAdmin, async (req, res) => {
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
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Admin stats
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin customers
  app.get("/api/admin/customers", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersWithOrders = await Promise.all(
        allUsers.map(async (user) => {
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
  app.post("/api/admin/customers", isAuthenticated, isAdmin, async (req, res) => {
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

  // Admin categories
  app.post("/api/admin/categories", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const parsed = insertCategorySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid category data" });
      const cat = await storage.createCategory(parsed.data);
      res.json(cat);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/admin/categories/:id", isAuthenticated, isAdmin, async (req, res) => {
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

  app.delete("/api/admin/categories/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      await storage.deleteCategory(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Admin coupons
  app.get("/api/admin/coupons", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const allCoupons = await storage.getCoupons();
      res.json(allCoupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.post("/api/admin/coupons", isAuthenticated, isAdmin, async (req, res) => {
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

  app.patch("/api/admin/coupons/:id", isAuthenticated, isAdmin, async (req, res) => {
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

  app.delete("/api/admin/coupons/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      await storage.deleteCoupon(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  return httpServer;
}
