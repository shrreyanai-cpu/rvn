import {
  categories, products, cartItems, orders, coupons, deliverySettings, addresses, returnRequests, reviews,
  newsletterSubscribers, instagramPosts, contactMessages, adminNotifications,
  wishlists, seasonalBanners, abandonedCartEmails,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type Coupon, type InsertCoupon,
  type DeliverySettings,
  type Address, type InsertAddress,
  type ReturnRequest, type InsertReturnRequest,
  type Review, type InsertReview,
  type NewsletterSubscriber, type InsertNewsletterSubscriber,
  type InstagramPost, type InsertInstagramPost,
  type ContactMessage, type InsertContactMessage,
  type AdminNotification,
  type Wishlist, type InsertWishlist,
  type SeasonalBanner, type InsertSeasonalBanner,
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { db } from "./db";
import { eq, and, desc, sql, count, inArray, gte, lte, isNull, or } from "drizzle-orm";

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
  updateOrderPackage(id: number, data: { packageLength?: string | null; packageWidth?: string | null; packageHeight?: string | null; packageWeight?: string | null }): Promise<Order | undefined>;
  updateOrderTracking(id: number, data: { delhiveryWaybill?: string; delhiveryStatus?: string; trackingUrl?: string }): Promise<Order | undefined>;

  getAddresses(userId: string): Promise<Address[]>;
  getAddressById(id: number, userId: string): Promise<Address | undefined>;
  createAddress(data: InsertAddress): Promise<Address>;
  updateAddress(id: number, userId: string, data: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: number, userId: string): Promise<void>;
  setDefaultAddress(id: number, userId: string): Promise<void>;

  createReturnRequest(data: InsertReturnRequest): Promise<ReturnRequest>;
  getReturnRequestsByUser(userId: string): Promise<ReturnRequest[]>;
  getReturnRequestByOrderId(orderId: number): Promise<ReturnRequest | undefined>;
  getAllReturnRequests(): Promise<ReturnRequest[]>;
  updateReturnRequest(id: number, data: { status: string; adminNotes?: string }): Promise<ReturnRequest | undefined>;

  getReviewsByProductId(productId: number): Promise<(Review & { userName: string })[]>;
  getReviewByUserAndProduct(userId: string, productId: number): Promise<Review | undefined>;
  createReview(data: InsertReview): Promise<Review>;
  deleteReview(id: number, userId: string): Promise<void>;
  getProductAverageRating(productId: number): Promise<{ average: number; count: number }>;
  getProductsAverageRatings(productIds: number[]): Promise<Record<number, { average: number; count: number }>>;

  getAbandonedCarts(minutesThreshold: number): Promise<Array<{ userId: string; customerName: string; customerPhone: string; items: Array<{ name: string; quantity: number; price: string }>; totalValue: string }>>;
  markCartNotified(userId: string): Promise<void>;

  getNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
  addNewsletterSubscriber(data: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  deleteNewsletterSubscriber(id: number): Promise<void>;

  getInstagramPosts(): Promise<InstagramPost[]>;
  createInstagramPost(data: InsertInstagramPost): Promise<InstagramPost>;
  deleteInstagramPost(id: number): Promise<void>;

  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(data: InsertContactMessage): Promise<ContactMessage>;
  markContactMessageRead(id: number): Promise<void>;

  getFlashSaleProducts(): Promise<Product[]>;
  getSalesAnalytics(): Promise<{ dailyRevenue: Array<{ date: string; revenue: number; orders: number }>; topProducts: Array<{ name: string; sold: number; revenue: number }>; categoryBreakdown: Array<{ category: string; revenue: number; orders: number }>; orderStatusBreakdown: Array<{ status: string; count: number }> }>;

  getAdminNotifications(limit?: number): Promise<AdminNotification[]>;
  getUnreadNotificationCount(): Promise<number>;
  createAdminNotification(data: { type: string; title: string; message: string; orderId?: number }): Promise<AdminNotification>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(): Promise<void>;

  getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(data: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;
  isInWishlist(userId: string, productId: number): Promise<boolean>;

  getActiveBanners(): Promise<SeasonalBanner[]>;
  getAllBanners(): Promise<SeasonalBanner[]>;
  createBanner(data: InsertSeasonalBanner): Promise<SeasonalBanner>;
  updateBanner(id: number, data: Partial<InsertSeasonalBanner>): Promise<SeasonalBanner | undefined>;
  deleteBanner(id: number): Promise<void>;

  getEnhancedStats(): Promise<{
    totalCustomers: number; totalRevenue: number; totalOrders: number; totalProducts: number;
    todayRevenue: number; todayOrders: number; pendingOrders: number; lowStockProducts: number;
    thisMonthRevenue: number; lastMonthRevenue: number; avgOrderValue: number;
  }>;

  getAbandonedCartsForEmail(hoursThreshold: number): Promise<Array<{ userId: string; email: string; items: Array<{ name: string; quantity: number; price: string; imageUrl?: string }>; totalValue: string }>>;
  recordAbandonedCartEmail(userId: string, email: string, cartValue: string): Promise<void>;
  wasAbandonedCartEmailSent(userId: string, hoursAgo: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.name);
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
    const [customerCount] = await db.select({ value: count() }).from(users).where(eq(users.role, "customer"));
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

  async updateOrderPackage(id: number, data: { packageLength?: string | null; packageWidth?: string | null; packageHeight?: string | null; packageWeight?: string | null }): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set({ ...data, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return updated;
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

  async createReturnRequest(data: InsertReturnRequest): Promise<ReturnRequest> {
    const [req] = await db.insert(returnRequests).values(data).returning();
    return req;
  }

  async getReturnRequestsByUser(userId: string): Promise<ReturnRequest[]> {
    return db.select().from(returnRequests).where(eq(returnRequests.userId, userId)).orderBy(desc(returnRequests.createdAt));
  }

  async getReturnRequestByOrderId(orderId: number): Promise<ReturnRequest | undefined> {
    const [req] = await db.select().from(returnRequests).where(eq(returnRequests.orderId, orderId)).limit(1);
    return req;
  }

  async getAllReturnRequests(): Promise<ReturnRequest[]> {
    return db.select().from(returnRequests).orderBy(desc(returnRequests.createdAt));
  }

  async updateReturnRequest(id: number, data: { status: string; adminNotes?: string }): Promise<ReturnRequest | undefined> {
    const [updated] = await db.update(returnRequests).set({ ...data, updatedAt: new Date() }).where(eq(returnRequests.id, id)).returning();
    return updated;
  }

  async getReviewsByProductId(productId: number): Promise<(Review & { userName: string })[]> {
    const result = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userName: sql<string>`COALESCE(NULLIF(TRIM(CONCAT(${users.firstName}, ' ', ${users.lastName})), ''), ${users.email}, 'Customer')`,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
    return result as (Review & { userName: string })[];
  }

  async getReviewByUserAndProduct(userId: string, productId: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)))
      .limit(1);
    return review;
  }

  async createReview(data: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  }

  async deleteReview(id: number, userId: string): Promise<void> {
    await db.delete(reviews).where(and(eq(reviews.id, id), eq(reviews.userId, userId)));
  }

  async getProductAverageRating(productId: number): Promise<{ average: number; count: number }> {
    const [result] = await db
      .select({
        average: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.productId, productId));
    return { average: Number(result.average), count: Number(result.count) };
  }

  async getProductsAverageRatings(productIds: number[]): Promise<Record<number, { average: number; count: number }>> {
    if (productIds.length === 0) return {};
    const results = await db
      .select({
        productId: reviews.productId,
        average: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(reviews)
      .where(inArray(reviews.productId, productIds))
      .groupBy(reviews.productId);
    const map: Record<number, { average: number; count: number }> = {};
    for (const r of results) {
      map[r.productId] = { average: Number(r.average), count: Number(r.count) };
    }
    return map;
  }

  async getAbandonedCarts(minutesThreshold: number) {
    const threshold = new Date(Date.now() - minutesThreshold * 60 * 1000);
    const result = await db
      .select({
        userId: cartItems.userId,
        productName: products.name,
        quantity: cartItems.quantity,
        price: products.price,
        addedAt: cartItems.addedAt,
        whatsappNotifiedAt: cartItems.whatsappNotifiedAt,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(sql`${cartItems.addedAt} < ${threshold} AND ${cartItems.whatsappNotifiedAt} IS NULL`);

    const grouped: Record<string, typeof result> = {};
    for (const row of result) {
      if (!grouped[row.userId]) grouped[row.userId] = [];
      grouped[row.userId].push(row);
    }

    const carts = [];
    for (const [userId, items] of Object.entries(grouped)) {
      const user = await this.getUserById(userId);
      if (!user) continue;

      const totalValue = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2);
      const savedAddr = user.savedShippingAddress as any;

      carts.push({
        userId,
        customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Customer',
        customerPhone: savedAddr?.phone || '',
        items: items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        totalValue,
      });
    }

    return carts;
  }

  async markCartNotified(userId: string) {
    await db
      .update(cartItems)
      .set({ whatsappNotifiedAt: new Date() })
      .where(eq(cartItems.userId, userId));
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt));
  }

  async addNewsletterSubscriber(data: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [sub] = await db.insert(newsletterSubscribers).values(data).returning();
    return sub;
  }

  async deleteNewsletterSubscriber(id: number): Promise<void> {
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
  }

  async getInstagramPosts(): Promise<InstagramPost[]> {
    return db.select().from(instagramPosts).orderBy(instagramPosts.sortOrder);
  }

  async createInstagramPost(data: InsertInstagramPost): Promise<InstagramPost> {
    const [post] = await db.insert(instagramPosts).values(data).returning();
    return post;
  }

  async deleteInstagramPost(id: number): Promise<void> {
    await db.delete(instagramPosts).where(eq(instagramPosts.id, id));
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(data: InsertContactMessage): Promise<ContactMessage> {
    const [msg] = await db.insert(contactMessages).values(data).returning();
    return msg;
  }

  async markContactMessageRead(id: number): Promise<void> {
    await db.update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, id));
  }

  async getFlashSaleProducts(): Promise<Product[]> {
    const now = new Date();
    const allProducts = await db.select().from(products);
    return allProducts.filter(p =>
      p.flashSalePrice && p.flashSaleStart && p.flashSaleEnd &&
      new Date(p.flashSaleStart) <= now && new Date(p.flashSaleEnd) >= now
    );
  }

  async getSalesAnalytics() {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const paidOrders = allOrders.filter(o => o.paymentStatus === 'paid');

    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    for (const o of paidOrders) {
      const date = new Date(o.createdAt || new Date()).toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { revenue: 0, orders: 0 };
      existing.revenue += Number(o.totalAmount);
      existing.orders += 1;
      dailyMap.set(date, existing);
    }
    const dailyRevenue = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    const productSales = new Map<string, { sold: number; revenue: number }>();
    for (const o of paidOrders) {
      const items = o.items as Array<{ name: string; quantity: number; price: string }>;
      if (Array.isArray(items)) {
        for (const item of items) {
          const existing = productSales.get(item.name) || { sold: 0, revenue: 0 };
          existing.sold += item.quantity;
          existing.revenue += Number(item.price) * item.quantity;
          productSales.set(item.name, existing);
        }
      }
    }
    const topProducts = Array.from(productSales.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const allCats = await db.select().from(categories);
    const catMap = new Map(allCats.map(c => [c.id, c.name]));
    const allProds = await db.select().from(products);
    const prodCatMap = new Map(allProds.map(p => [p.name, catMap.get(p.categoryId || 0) || 'Uncategorized']));
    const catBreakdown = new Map<string, { revenue: number; orders: number }>();
    for (const o of paidOrders) {
      const items = o.items as Array<{ name: string; quantity: number; price: string }>;
      if (Array.isArray(items)) {
        for (const item of items) {
          const cat = prodCatMap.get(item.name) || 'Uncategorized';
          const existing = catBreakdown.get(cat) || { revenue: 0, orders: 0 };
          existing.revenue += Number(item.price) * item.quantity;
          existing.orders += 1;
          catBreakdown.set(cat, existing);
        }
      }
    }
    const categoryBreakdown = Array.from(catBreakdown.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    const statusMap = new Map<string, number>();
    for (const o of allOrders) {
      const s = o.status || 'pending';
      statusMap.set(s, (statusMap.get(s) || 0) + 1);
    }
    const orderStatusBreakdown = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }));

    return { dailyRevenue, topProducts, categoryBreakdown, orderStatusBreakdown };
  }

  async getAdminNotifications(limit = 50): Promise<AdminNotification[]> {
    return db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt)).limit(limit);
  }

  async getUnreadNotificationCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(adminNotifications).where(eq(adminNotifications.isRead, false));
    return result?.count || 0;
  }

  async createAdminNotification(data: { type: string; title: string; message: string; orderId?: number }): Promise<AdminNotification> {
    const [notif] = await db.insert(adminNotifications).values(data).returning();
    return notif;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.id, id));
  }

  async markAllNotificationsRead(): Promise<void> {
    await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.isRead, false));
  }

  async getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]> {
    const items = await db.select().from(wishlists).where(eq(wishlists.userId, userId)).orderBy(desc(wishlists.createdAt));
    const result: (Wishlist & { product: Product })[] = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (product) result.push({ ...item, product });
    }
    return result;
  }

  async addToWishlist(data: InsertWishlist): Promise<Wishlist> {
    const existing = await db.select().from(wishlists).where(and(eq(wishlists.userId, data.userId), eq(wishlists.productId, data.productId)));
    if (existing.length > 0) return existing[0];
    const [item] = await db.insert(wishlists).values(data).returning();
    return item;
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    await db.delete(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
  }

  async isInWishlist(userId: string, productId: number): Promise<boolean> {
    const [item] = await db.select().from(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    return !!item;
  }

  async getActiveBanners(): Promise<SeasonalBanner[]> {
    const now = new Date();
    const all = await db.select().from(seasonalBanners).where(eq(seasonalBanners.isActive, true)).orderBy(seasonalBanners.sortOrder);
    return all.filter(b => {
      if (b.startDate && new Date(b.startDate) > now) return false;
      if (b.endDate && new Date(b.endDate) < now) return false;
      return true;
    });
  }

  async getAllBanners(): Promise<SeasonalBanner[]> {
    return db.select().from(seasonalBanners).orderBy(desc(seasonalBanners.createdAt));
  }

  async createBanner(data: InsertSeasonalBanner): Promise<SeasonalBanner> {
    const [banner] = await db.insert(seasonalBanners).values(data).returning();
    return banner;
  }

  async updateBanner(id: number, data: Partial<InsertSeasonalBanner>): Promise<SeasonalBanner | undefined> {
    const [banner] = await db.update(seasonalBanners).set(data).where(eq(seasonalBanners.id, id)).returning();
    return banner;
  }

  async deleteBanner(id: number): Promise<void> {
    await db.delete(seasonalBanners).where(eq(seasonalBanners.id, id));
  }

  async getEnhancedStats() {
    const [customerCount] = await db.select({ count: count() }).from(users);
    const [productCount] = await db.select({ count: count() }).from(products);
    const allOrders = await db.select().from(orders);
    const paidOrders = allOrders.filter(o => o.paymentStatus === "paid");

    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = paidOrders.filter(o => o.createdAt && new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const pendingOrders = allOrders.filter(o => o.status === "pending").length;

    const [lowStock] = await db.select({ count: count() }).from(products).where(and(eq(products.inStock, true), lte(products.stockQuantity, 5)));

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisMonthRevenue = paidOrders.filter(o => o.createdAt && new Date(o.createdAt) >= thisMonthStart).reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const lastMonthRevenue = paidOrders.filter(o => o.createdAt && new Date(o.createdAt) >= lastMonthStart && new Date(o.createdAt!) < thisMonthStart).reduce((sum, o) => sum + Number(o.totalAmount), 0);

    return {
      totalCustomers: customerCount?.count || 0,
      totalRevenue,
      totalOrders: allOrders.length,
      totalProducts: productCount?.count || 0,
      todayRevenue,
      todayOrders: todayOrders.length,
      pendingOrders,
      lowStockProducts: lowStock?.count || 0,
      thisMonthRevenue,
      lastMonthRevenue,
      avgOrderValue: Math.round(avgOrderValue),
    };
  }

  async getAbandonedCartsForEmail(hoursThreshold: number) {
    const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
    const carts = await db.select().from(cartItems).where(lte(cartItems.addedAt, threshold));
    const userMap = new Map<string, typeof carts>();
    for (const item of carts) {
      if (!userMap.has(item.userId)) userMap.set(item.userId, []);
      userMap.get(item.userId)!.push(item);
    }

    const result: Array<{ userId: string; email: string; items: Array<{ name: string; quantity: number; price: string; imageUrl?: string }>; totalValue: string }> = [];
    for (const [userId, items] of Array.from(userMap.entries())) {
      const user = await db.select().from(users).where(eq(users.id, userId)).then(r => r[0]);
      if (!user?.email) continue;
      const enrichedItems: Array<{ name: string; quantity: number; price: string; imageUrl?: string }> = [];
      let total = 0;
      for (const ci of items) {
        const [prod] = await db.select().from(products).where(eq(products.id, ci.productId));
        if (prod) {
          enrichedItems.push({ name: prod.name, quantity: ci.quantity, price: String(prod.price), imageUrl: prod.images?.[0] });
          total += Number(prod.price) * ci.quantity;
        }
      }
      if (enrichedItems.length > 0) {
        result.push({ userId, email: user.email, items: enrichedItems, totalValue: total.toFixed(2) });
      }
    }
    return result;
  }

  async recordAbandonedCartEmail(userId: string, email: string, cartValue: string): Promise<void> {
    await db.insert(abandonedCartEmails).values({ userId, email, cartValue });
  }

  async wasAbandonedCartEmailSent(userId: string, hoursAgo: number): Promise<boolean> {
    const threshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const [result] = await db.select({ count: count() }).from(abandonedCartEmails)
      .where(and(eq(abandonedCartEmails.userId, userId), gte(abandonedCartEmails.sentAt, threshold)));
    return (result?.count || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
