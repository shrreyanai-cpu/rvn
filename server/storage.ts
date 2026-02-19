import {
  categories, products, cartItems, orders, coupons, deliverySettings, addresses,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type Coupon, type InsertCoupon,
  type DeliverySettings,
  type Address, type InsertAddress,
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { db } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(data: InsertCategory): Promise<Category>;

  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addCartItem(data: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, userId: string, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number, userId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  getOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(data: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updateOrderPayment(id: number, data: { paymentStatus: string; cashfreeOrderId?: string }): Promise<Order | undefined>;
  deleteOrder(id: number, userId: string): Promise<void>;
  adminDeleteOrder(id: number): Promise<void>;

  updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<void>;

  getCoupons(): Promise<Coupon[]>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(data: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, data: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: number): Promise<void>;

  getAllUsers(): Promise<any[]>;
  getUserById(userId: string): Promise<any>;
  getUserOrderCount(userId: string): Promise<number>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getAdminStats(): Promise<{ totalCustomers: number; totalRevenue: number; totalOrders: number; totalProducts: number }>;

  getDeliverySettings(): Promise<DeliverySettings | undefined>;
  upsertDeliverySettings(data: Partial<DeliverySettings>): Promise<DeliverySettings>;
  updateOrderTracking(id: number, data: { delhiveryWaybill?: string; delhiveryStatus?: string; trackingUrl?: string }): Promise<Order | undefined>;

  getAddresses(userId: string): Promise<Address[]>;
  getAddressById(id: number, userId: string): Promise<Address | undefined>;
  createAddress(data: InsertAddress): Promise<Address>;
  updateAddress(id: number, userId: string, data: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: number, userId: string): Promise<void>;
  setDefaultAddress(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
    return cat;
  }

  async createCategory(data: InsertCategory): Promise<Category> {
    const [cat] = await db.insert(categories).values(data).returning();
    return cat;
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.featured, true)).orderBy(desc(products.createdAt));
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    const result: (CartItem & { product: Product })[] = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (product) {
        result.push({ ...item, product });
      }
    }
    return result;
  }

  async addCartItem(data: InsertCartItem): Promise<CartItem> {
    const predicates = [
      eq(cartItems.userId, data.userId),
      eq(cartItems.productId, data.productId),
    ];
    if (data.size) predicates.push(eq(cartItems.size, data.size));
    if (data.color) predicates.push(eq(cartItems.color, data.color));

    const existing = await db
      .select()
      .from(cartItems)
      .where(and(...predicates));

    if (existing.length > 0) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + (data.quantity || 1) })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return updated;
    }

    const [item] = await db.insert(cartItems).values(data).returning();
    return item;
  }

  async updateCartItem(id: number, userId: string, quantity: number): Promise<CartItem | undefined> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)))
      .returning();
    return item;
  }

  async removeCartItem(id: number, userId: string): Promise<void> {
    await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getOrders(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(data: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(data).returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async updateOrderPayment(id: number, data: { paymentStatus: string; cashfreeOrderId?: string }): Promise<Order | undefined> {
    const updateData: any = { paymentStatus: data.paymentStatus, updatedAt: new Date() };
    if (data.cashfreeOrderId) updateData.cashfreeOrderId = data.cashfreeOrderId;
    const [order] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return order;
  }

  async deleteOrder(id: number, userId: string): Promise<void> {
    await db.delete(orders).where(and(eq(orders.id, id), eq(orders.userId, userId)));
  }

  async adminDeleteOrder(id: number): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const [cat] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return cat;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getCoupons(): Promise<Coupon[]> {
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
    return coupon;
  }

  async createCoupon(data: InsertCoupon): Promise<Coupon> {
    const [coupon] = await db.insert(coupons).values({ ...data, code: data.code.toUpperCase() }).returning();
    return coupon;
  }

  async updateCoupon(id: number, data: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const updateData: any = { ...data };
    if (data.code) updateData.code = data.code.toUpperCase();
    const [coupon] = await db.update(coupons).set(updateData).where(eq(coupons.id, id)).returning();
    return coupon;
  }

  async deleteCoupon(id: number): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  async getAllUsers(): Promise<any[]> {
    const result = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      isAdmin: users.isAdmin,
      role: users.role,
      createdAt: users.createdAt,
      phone: users.phone,
    }).from(users).orderBy(desc(users.createdAt));
    return result;
  }

  async getUserById(userId: string): Promise<any> {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      isAdmin: users.isAdmin,
      role: users.role,
      createdAt: users.createdAt,
      phone: users.phone,
      savedShippingAddress: users.savedShippingAddress,
    }).from(users).where(eq(users.id, userId));
    return user;
  }

  async getUserOrderCount(userId: string): Promise<number> {
    const [result] = await db.select({ value: count() }).from(orders).where(eq(orders.userId, userId));
    return result?.value || 0;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAdminStats(): Promise<{ totalCustomers: number; totalRevenue: number; totalOrders: number; totalProducts: number }> {
    const [customerCount] = await db.select({ value: count() }).from(users);
    const [productCount] = await db.select({ value: count() }).from(products);
    const [orderCount] = await db.select({ value: count() }).from(orders);
    const revenueResult = await db.select({ total: sql<string>`COALESCE(SUM(total_amount::numeric), 0)` }).from(orders);
    return {
      totalCustomers: customerCount?.value || 0,
      totalProducts: productCount?.value || 0,
      totalOrders: orderCount?.value || 0,
      totalRevenue: Number(revenueResult[0]?.total) || 0,
    };
  }

  async getDeliverySettings(): Promise<DeliverySettings | undefined> {
    const [settings] = await db.select().from(deliverySettings).limit(1);
    return settings;
  }

  async upsertDeliverySettings(data: Partial<DeliverySettings>): Promise<DeliverySettings> {
    const existing = await this.getDeliverySettings();
    if (existing) {
      const [updated] = await db.update(deliverySettings).set({ ...data, updatedAt: new Date() }).where(eq(deliverySettings.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(deliverySettings).values(data as any).returning();
    return created;
  }

  async updateOrderTracking(id: number, data: { delhiveryWaybill?: string; delhiveryStatus?: string; trackingUrl?: string }): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set({ ...data, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return updated;
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
  }

  async getAddressById(id: number, userId: string): Promise<Address | undefined> {
    const [addr] = await db.select().from(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
    return addr;
  }

  async createAddress(data: InsertAddress): Promise<Address> {
    const existing = await this.getAddresses(data.userId);
    if (existing.length === 0) {
      data.isDefault = true;
    }
    const [addr] = await db.insert(addresses).values(data).returning();
    return addr;
  }

  async updateAddress(id: number, userId: string, data: Partial<InsertAddress>): Promise<Address | undefined> {
    const [updated] = await db.update(addresses).set(data).where(and(eq(addresses.id, id), eq(addresses.userId, userId))).returning();
    return updated;
  }

  async deleteAddress(id: number, userId: string): Promise<void> {
    const addr = await this.getAddressById(id, userId);
    await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
    if (addr?.isDefault) {
      const remaining = await this.getAddresses(userId);
      if (remaining.length > 0) {
        await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, remaining[0].id));
      }
    }
  }

  async setDefaultAddress(id: number, userId: string): Promise<void> {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    await db.update(addresses).set({ isDefault: true }).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
