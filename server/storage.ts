import {
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
import { JsonCollection } from "./file-db";

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

const categoriesDb = new JsonCollection<Category>("categories");
const productsDb = new JsonCollection<Product>("products");
const cartItemsDb = new JsonCollection<CartItem>("cart_items");
const ordersDb = new JsonCollection<Order>("orders");
const couponsDb = new JsonCollection<Coupon>("coupons");
const deliverySettingsDb = new JsonCollection<DeliverySettings>("delivery_settings");
const addressesDb = new JsonCollection<Address>("addresses");
const returnRequestsDb = new JsonCollection<ReturnRequest>("return_requests");
const reviewsDb = new JsonCollection<Review>("reviews");
const newsletterDb = new JsonCollection<NewsletterSubscriber>("newsletter_subscribers");
const instagramDb = new JsonCollection<InstagramPost>("instagram_posts");
const contactDb = new JsonCollection<ContactMessage>("contact_messages");
const notificationsDb = new JsonCollection<AdminNotification>("admin_notifications");
const wishlistsDb = new JsonCollection<Wishlist>("wishlists");
const bannersDb = new JsonCollection<SeasonalBanner>("seasonal_banners");
const abandonedCartEmailsDb = new JsonCollection<any>("abandoned_cart_emails");
const usersDb = new JsonCollection<any>("users");

export class FileStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return categoriesDb.getAll().sort((a, b) => a.name.localeCompare(b.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return categoriesDb.findOne((c) => c.slug === slug);
  }

  async createCategory(data: InsertCategory): Promise<Category> {
    const cat: Category = {
      id: categoriesDb.nextId(),
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      parentId: data.parentId || null,
      imageUrl: (data as any).imageUrl || null,
      createdAt: new Date(),
    };
    return categoriesDb.insert(cat);
  }

  async getProducts(): Promise<Product[]> {
    return productsDb.getAll().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return productsDb.find((p) => p.featured === true).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return productsDb.findOne((p) => p.slug === slug);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return productsDb.getById(id);
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const product: Product = {
      id: productsDb.nextId(),
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      categoryId: data.categoryId || null,
      images: data.images || null,
      sizes: data.sizes || null,
      colors: data.colors || null,
      material: data.material || null,
      brand: (data as any).brand || null,
      inStock: data.inStock ?? true,
      stockQuantity: (data as any).stockQuantity ?? 0,
      featured: data.featured ?? false,
      weight: (data as any).weight || null,
      flashSalePrice: (data as any).flashSalePrice || null,
      flashSaleStart: (data as any).flashSaleStart || null,
      flashSaleEnd: (data as any).flashSaleEnd || null,
      createdAt: new Date(),
    };
    return productsDb.insert(product);
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    return productsDb.update(id, data as any);
  }

  async deleteProduct(id: number): Promise<void> {
    productsDb.delete(id);
  }

  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    const items = cartItemsDb.find((ci) => ci.userId === userId);
    const result: (CartItem & { product: Product })[] = [];
    for (const item of items) {
      const product = productsDb.getById(item.productId);
      if (product) result.push({ ...item, product });
    }
    return result;
  }

  async addCartItem(data: InsertCartItem): Promise<CartItem> {
    const existing = cartItemsDb.findOne((ci) =>
      ci.userId === data.userId &&
      ci.productId === data.productId &&
      (!data.size || ci.size === data.size) &&
      (!data.color || ci.color === data.color)
    );

    if (existing) {
      const updated = cartItemsDb.update(existing.id, { quantity: existing.quantity + (data.quantity || 1) });
      return updated!;
    }

    const item: CartItem = {
      id: cartItemsDb.nextId(),
      userId: data.userId,
      productId: data.productId,
      quantity: data.quantity || 1,
      size: data.size || null,
      color: data.color || null,
      addedAt: new Date(),
      whatsappNotifiedAt: null,
    };
    return cartItemsDb.insert(item);
  }

  async updateCartItem(id: number, userId: string, quantity: number): Promise<CartItem | undefined> {
    const item = cartItemsDb.findOne((ci) => ci.id === id && ci.userId === userId);
    if (!item) return undefined;
    return cartItemsDb.update(id, { quantity });
  }

  async removeCartItem(id: number, userId: string): Promise<void> {
    cartItemsDb.deleteWhere((ci) => ci.id === id && ci.userId === userId);
  }

  async clearCart(userId: string): Promise<void> {
    cartItemsDb.deleteWhere((ci) => ci.userId === userId);
  }

  async getOrders(userId: string): Promise<Order[]> {
    return ordersDb.find((o) => o.userId === userId).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getAllOrders(): Promise<Order[]> {
    return ordersDb.getAll().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return ordersDb.getById(id);
  }

  async createOrder(data: InsertOrder): Promise<Order> {
    const order: Order = {
      id: ordersDb.nextId(),
      userId: data.userId,
      items: data.items,
      totalAmount: data.totalAmount,
      status: data.status || "pending",
      paymentStatus: data.paymentStatus || "pending",
      shippingAddress: data.shippingAddress,
      cashfreeOrderId: (data as any).cashfreeOrderId || null,
      couponCode: (data as any).couponCode || null,
      discountAmount: (data as any).discountAmount || null,
      delhiveryWaybill: null,
      delhiveryStatus: null,
      trackingUrl: null,
      packageLength: null,
      packageWidth: null,
      packageHeight: null,
      packageWeight: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return ordersDb.insert(order);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    return ordersDb.update(id, { status, updatedAt: new Date() } as any);
  }

  async updateOrderPayment(id: number, data: { paymentStatus: string; cashfreeOrderId?: string }): Promise<Order | undefined> {
    const updateData: any = { paymentStatus: data.paymentStatus, updatedAt: new Date() };
    if (data.cashfreeOrderId) updateData.cashfreeOrderId = data.cashfreeOrderId;
    return ordersDb.update(id, updateData);
  }

  async deleteOrder(id: number, userId: string): Promise<void> {
    ordersDb.deleteWhere((o) => o.id === id && o.userId === userId);
  }

  async adminDeleteOrder(id: number): Promise<void> {
    ordersDb.delete(id);
  }

  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
    return categoriesDb.update(id, data as any);
  }

  async deleteCategory(id: number): Promise<void> {
    categoriesDb.delete(id);
  }

  async getCoupons(): Promise<Coupon[]> {
    return couponsDb.getAll().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return couponsDb.findOne((c) => c.code === code.toUpperCase());
  }

  async createCoupon(data: InsertCoupon): Promise<Coupon> {
    const coupon: Coupon = {
      id: couponsDb.nextId(),
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount || null,
      maxUses: data.maxUses || null,
      usedCount: 0,
      isActive: data.isActive ?? true,
      expiresAt: data.expiresAt || null,
      createdAt: new Date(),
    };
    return couponsDb.insert(coupon);
  }

  async updateCoupon(id: number, data: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const updateData: any = { ...data };
    if (data.code) updateData.code = data.code.toUpperCase();
    return couponsDb.update(id, updateData);
  }

  async deleteCoupon(id: number): Promise<void> {
    couponsDb.delete(id);
  }

  async getAllUsers(): Promise<any[]> {
    return usersDb.getAll().map(({ password, ...u }) => u).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getUserById(userId: string): Promise<any> {
    const user = usersDb.getById(userId);
    if (!user) return undefined;
    const { password, ...safe } = user;
    return safe;
  }

  async getUserOrderCount(userId: string): Promise<number> {
    return ordersDb.count((o) => o.userId === userId);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return ordersDb.find((o) => o.userId === userId).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getAdminStats(): Promise<{ totalCustomers: number; totalRevenue: number; totalOrders: number; totalProducts: number }> {
    const allOrders = ordersDb.getAll();
    const paidOrders = allOrders.filter((o) => o.paymentStatus === "paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    return {
      totalCustomers: usersDb.count((u) => u.role === "customer" || !u.role),
      totalProducts: productsDb.count(),
      totalOrders: allOrders.length,
      totalRevenue,
    };
  }

  async getDeliverySettings(): Promise<DeliverySettings | undefined> {
    const all = deliverySettingsDb.getAll();
    return all[0];
  }

  async upsertDeliverySettings(data: Partial<DeliverySettings>): Promise<DeliverySettings> {
    const existing = await this.getDeliverySettings();
    if (existing) {
      const updated = deliverySettingsDb.update(existing.id, { ...data, updatedAt: new Date() } as any);
      return updated!;
    }
    const settings: DeliverySettings = {
      id: deliverySettingsDb.nextId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    return deliverySettingsDb.insert(settings);
  }

  async updateOrderPackage(id: number, data: { packageLength?: string | null; packageWidth?: string | null; packageHeight?: string | null; packageWeight?: string | null }): Promise<Order | undefined> {
    return ordersDb.update(id, { ...data, updatedAt: new Date() } as any);
  }

  async updateOrderTracking(id: number, data: { delhiveryWaybill?: string; delhiveryStatus?: string; trackingUrl?: string }): Promise<Order | undefined> {
    return ordersDb.update(id, { ...data, updatedAt: new Date() } as any);
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return addressesDb.find((a) => a.userId === userId).sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }

  async getAddressById(id: number, userId: string): Promise<Address | undefined> {
    return addressesDb.findOne((a) => a.id === id && a.userId === userId);
  }

  async createAddress(data: InsertAddress): Promise<Address> {
    const existing = addressesDb.find((a) => a.userId === data.userId);
    const addr: Address = {
      id: addressesDb.nextId(),
      userId: data.userId,
      label: data.label || null,
      fullName: data.fullName,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isDefault: existing.length === 0 ? true : (data.isDefault ?? false),
      createdAt: new Date(),
    };
    return addressesDb.insert(addr);
  }

  async updateAddress(id: number, userId: string, data: Partial<InsertAddress>): Promise<Address | undefined> {
    const addr = addressesDb.findOne((a) => a.id === id && a.userId === userId);
    if (!addr) return undefined;
    return addressesDb.update(id, data as any);
  }

  async deleteAddress(id: number, userId: string): Promise<void> {
    const addr = await this.getAddressById(id, userId);
    addressesDb.deleteWhere((a) => a.id === id && a.userId === userId);
    if (addr?.isDefault) {
      const remaining = addressesDb.find((a) => a.userId === userId);
      if (remaining.length > 0) {
        addressesDb.update(remaining[0].id, { isDefault: true });
      }
    }
  }

  async setDefaultAddress(id: number, userId: string): Promise<void> {
    addressesDb.updateWhere((a) => a.userId === userId, { isDefault: false } as any);
    addressesDb.updateWhere((a) => a.id === id && a.userId === userId, { isDefault: true } as any);
  }

  async createReturnRequest(data: InsertReturnRequest): Promise<ReturnRequest> {
    const req: ReturnRequest = {
      id: returnRequestsDb.nextId(),
      orderId: data.orderId,
      userId: data.userId,
      reason: data.reason,
      damageVideoUrl: data.damageVideoUrl || null,
      status: "pending",
      adminNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return returnRequestsDb.insert(req);
  }

  async getReturnRequestsByUser(userId: string): Promise<ReturnRequest[]> {
    return returnRequestsDb.find((r) => r.userId === userId).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getReturnRequestByOrderId(orderId: number): Promise<ReturnRequest | undefined> {
    return returnRequestsDb.findOne((r) => r.orderId === orderId);
  }

  async getAllReturnRequests(): Promise<ReturnRequest[]> {
    return returnRequestsDb.getAll().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async updateReturnRequest(id: number, data: { status: string; adminNotes?: string }): Promise<ReturnRequest | undefined> {
    return returnRequestsDb.update(id, { ...data, updatedAt: new Date() } as any);
  }

  async getReviewsByProductId(productId: number): Promise<(Review & { userName: string })[]> {
    const revs = reviewsDb.find((r) => r.productId === productId).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return revs.map((r) => {
      const user = usersDb.getById(r.userId);
      const userName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Customer" : "Customer";
      return { ...r, userName };
    });
  }

  async getReviewByUserAndProduct(userId: string, productId: number): Promise<Review | undefined> {
    return reviewsDb.findOne((r) => r.userId === userId && r.productId === productId);
  }

  async createReview(data: InsertReview): Promise<Review> {
    const review: Review = {
      id: reviewsDb.nextId(),
      productId: data.productId,
      userId: data.userId,
      rating: data.rating,
      title: data.title || null,
      comment: data.comment || null,
      createdAt: new Date(),
    };
    return reviewsDb.insert(review);
  }

  async deleteReview(id: number, userId: string): Promise<void> {
    reviewsDb.deleteWhere((r) => r.id === id && r.userId === userId);
  }

  async getProductAverageRating(productId: number): Promise<{ average: number; count: number }> {
    const revs = reviewsDb.find((r) => r.productId === productId);
    if (revs.length === 0) return { average: 0, count: 0 };
    const avg = revs.reduce((sum, r) => sum + r.rating, 0) / revs.length;
    return { average: avg, count: revs.length };
  }

  async getProductsAverageRatings(productIds: number[]): Promise<Record<number, { average: number; count: number }>> {
    const map: Record<number, { average: number; count: number }> = {};
    for (const pid of productIds) {
      const revs = reviewsDb.find((r) => r.productId === pid);
      if (revs.length > 0) {
        const avg = revs.reduce((sum, r) => sum + r.rating, 0) / revs.length;
        map[pid] = { average: avg, count: revs.length };
      }
    }
    return map;
  }

  async getAbandonedCarts(minutesThreshold: number) {
    const threshold = new Date(Date.now() - minutesThreshold * 60 * 1000);
    const abandoned = cartItemsDb.find((ci) =>
      ci.addedAt && new Date(ci.addedAt) < threshold && !ci.whatsappNotifiedAt
    );

    const grouped: Record<string, typeof abandoned> = {};
    for (const item of abandoned) {
      if (!grouped[item.userId]) grouped[item.userId] = [];
      grouped[item.userId].push(item);
    }

    const carts = [];
    for (const [userId, items] of Object.entries(grouped)) {
      const user = usersDb.getById(userId);
      if (!user) continue;
      const totalValue = items.reduce((sum, item) => {
        const prod = productsDb.getById(item.productId);
        return sum + (prod ? Number(prod.price) * item.quantity : 0);
      }, 0).toFixed(2);
      const savedAddr = user.savedShippingAddress as any;
      carts.push({
        userId,
        customerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Customer",
        customerPhone: savedAddr?.phone || "",
        items: items.map((item) => {
          const prod = productsDb.getById(item.productId);
          return { name: prod?.name || "Unknown", quantity: item.quantity, price: prod?.price || "0" };
        }),
        totalValue,
      });
    }
    return carts;
  }

  async markCartNotified(userId: string): Promise<void> {
    cartItemsDb.updateWhere((ci) => ci.userId === userId, { whatsappNotifiedAt: new Date() } as any);
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return newsletterDb.getAll().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async addNewsletterSubscriber(data: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const sub: NewsletterSubscriber = {
      id: newsletterDb.nextId(),
      email: data.email,
      createdAt: new Date(),
    };
    return newsletterDb.insert(sub);
  }

  async deleteNewsletterSubscriber(id: number): Promise<void> {
    newsletterDb.delete(id);
  }

  async getInstagramPosts(): Promise<InstagramPost[]> {
    return instagramDb.getAll().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async createInstagramPost(data: InsertInstagramPost): Promise<InstagramPost> {
    const post: InstagramPost = {
      id: instagramDb.nextId(),
      imageUrl: data.imageUrl,
      postUrl: data.postUrl || null,
      caption: data.caption || null,
      sortOrder: data.sortOrder || 0,
      createdAt: new Date(),
    };
    return instagramDb.insert(post);
  }

  async deleteInstagramPost(id: number): Promise<void> {
    instagramDb.delete(id);
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return contactDb.getAll().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createContactMessage(data: InsertContactMessage): Promise<ContactMessage> {
    const msg: ContactMessage = {
      id: contactDb.nextId(),
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
      isRead: false,
      createdAt: new Date(),
    };
    return contactDb.insert(msg);
  }

  async markContactMessageRead(id: number): Promise<void> {
    contactDb.update(id, { isRead: true } as any);
  }

  async getFlashSaleProducts(): Promise<Product[]> {
    const now = new Date();
    return productsDb.find((p) =>
      p.flashSalePrice && p.flashSaleStart && p.flashSaleEnd &&
      new Date(p.flashSaleStart) <= now && new Date(p.flashSaleEnd) >= now
    );
  }

  async getSalesAnalytics() {
    const allOrders = ordersDb.getAll().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    const paidOrders = allOrders.filter((o) => o.paymentStatus === "paid");

    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    for (const o of paidOrders) {
      const date = new Date(o.createdAt || new Date()).toISOString().split("T")[0];
      const existing = dailyMap.get(date) || { revenue: 0, orders: 0 };
      existing.revenue += Number(o.totalAmount);
      existing.orders += 1;
      dailyMap.set(date, existing);
    }
    const dailyRevenue = Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);

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
    const topProducts = Array.from(productSales.entries()).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    const allCats = categoriesDb.getAll();
    const catMap = new Map(allCats.map((c) => [c.id, c.name]));
    const allProds = productsDb.getAll();
    const prodCatMap = new Map(allProds.map((p) => [p.name, catMap.get(p.categoryId || 0) || "Uncategorized"]));
    const catBreakdown = new Map<string, { revenue: number; orders: number }>();
    for (const o of paidOrders) {
      const items = o.items as Array<{ name: string; quantity: number; price: string }>;
      if (Array.isArray(items)) {
        for (const item of items) {
          const cat = prodCatMap.get(item.name) || "Uncategorized";
          const existing = catBreakdown.get(cat) || { revenue: 0, orders: 0 };
          existing.revenue += Number(item.price) * item.quantity;
          existing.orders += 1;
          catBreakdown.set(cat, existing);
        }
      }
    }
    const categoryBreakdown = Array.from(catBreakdown.entries()).map(([category, data]) => ({ category, ...data })).sort((a, b) => b.revenue - a.revenue);

    const statusMap = new Map<string, number>();
    for (const o of allOrders) {
      const s = o.status || "pending";
      statusMap.set(s, (statusMap.get(s) || 0) + 1);
    }
    const orderStatusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    return { dailyRevenue, topProducts, categoryBreakdown, orderStatusBreakdown };
  }

  async getAdminNotifications(limit = 50): Promise<AdminNotification[]> {
    return notificationsDb.getAll().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, limit);
  }

  async getUnreadNotificationCount(): Promise<number> {
    return notificationsDb.count((n) => n.isRead === false);
  }

  async createAdminNotification(data: { type: string; title: string; message: string; orderId?: number }): Promise<AdminNotification> {
    const notif: AdminNotification = {
      id: notificationsDb.nextId(),
      type: data.type,
      title: data.title,
      message: data.message,
      orderId: data.orderId || null,
      isRead: false,
      createdAt: new Date(),
    };
    return notificationsDb.insert(notif);
  }

  async markNotificationRead(id: number): Promise<void> {
    notificationsDb.update(id, { isRead: true } as any);
  }

  async markAllNotificationsRead(): Promise<void> {
    notificationsDb.updateWhere((n) => n.isRead === false, { isRead: true } as any);
  }

  async getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]> {
    const items = wishlistsDb.find((w) => w.userId === userId).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    const result: (Wishlist & { product: Product })[] = [];
    for (const item of items) {
      const product = productsDb.getById(item.productId);
      if (product) result.push({ ...item, product });
    }
    return result;
  }

  async addToWishlist(data: InsertWishlist): Promise<Wishlist> {
    const existing = wishlistsDb.findOne((w) => w.userId === data.userId && w.productId === data.productId);
    if (existing) return existing;
    const item: Wishlist = {
      id: wishlistsDb.nextId(),
      userId: data.userId,
      productId: data.productId,
      createdAt: new Date(),
    };
    return wishlistsDb.insert(item);
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    wishlistsDb.deleteWhere((w) => w.userId === userId && w.productId === productId);
  }

  async isInWishlist(userId: string, productId: number): Promise<boolean> {
    return !!wishlistsDb.findOne((w) => w.userId === userId && w.productId === productId);
  }

  async getActiveBanners(): Promise<SeasonalBanner[]> {
    const now = new Date();
    return bannersDb.find((b) => {
      if (!b.isActive) return false;
      if (b.startDate && new Date(b.startDate) > now) return false;
      if (b.endDate && new Date(b.endDate) < now) return false;
      return true;
    }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getAllBanners(): Promise<SeasonalBanner[]> {
    return bannersDb.getAll().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createBanner(data: InsertSeasonalBanner): Promise<SeasonalBanner> {
    const banner: SeasonalBanner = {
      id: bannersDb.nextId(),
      title: data.title,
      subtitle: data.subtitle || null,
      imageUrl: data.imageUrl || null,
      linkUrl: data.linkUrl || null,
      isActive: data.isActive ?? true,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      sortOrder: data.sortOrder || 0,
      createdAt: new Date(),
    };
    return bannersDb.insert(banner);
  }

  async updateBanner(id: number, data: Partial<InsertSeasonalBanner>): Promise<SeasonalBanner | undefined> {
    return bannersDb.update(id, data as any);
  }

  async deleteBanner(id: number): Promise<void> {
    bannersDb.delete(id);
  }

  async getEnhancedStats() {
    const allOrders = ordersDb.getAll();
    const paidOrders = allOrders.filter((o) => o.paymentStatus === "paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = paidOrders.filter((o) => o.createdAt && new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
    const lowStockProducts = productsDb.count((p) => p.inStock === true && (p.stockQuantity || 0) <= 5);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisMonthRevenue = paidOrders.filter((o) => o.createdAt && new Date(o.createdAt) >= thisMonthStart).reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const lastMonthRevenue = paidOrders.filter((o) => o.createdAt && new Date(o.createdAt) >= lastMonthStart && new Date(o.createdAt!) < thisMonthStart).reduce((sum, o) => sum + Number(o.totalAmount), 0);

    return {
      totalCustomers: usersDb.count(),
      totalRevenue,
      totalOrders: allOrders.length,
      totalProducts: productsDb.count(),
      todayRevenue,
      todayOrders: todayOrders.length,
      pendingOrders,
      lowStockProducts,
      thisMonthRevenue,
      lastMonthRevenue,
      avgOrderValue: Math.round(avgOrderValue),
    };
  }

  async getAbandonedCartsForEmail(hoursThreshold: number) {
    const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
    const carts = cartItemsDb.find((ci) => ci.addedAt && new Date(ci.addedAt) <= threshold);
    const userMap = new Map<string, typeof carts>();
    for (const item of carts) {
      if (!userMap.has(item.userId)) userMap.set(item.userId, []);
      userMap.get(item.userId)!.push(item);
    }

    const result: Array<{ userId: string; email: string; items: Array<{ name: string; quantity: number; price: string; imageUrl?: string }>; totalValue: string }> = [];
    for (const [userId, items] of Array.from(userMap.entries())) {
      const user = usersDb.getById(userId);
      if (!user?.email) continue;
      const enrichedItems: Array<{ name: string; quantity: number; price: string; imageUrl?: string }> = [];
      let total = 0;
      for (const ci of items) {
        const prod = productsDb.getById(ci.productId);
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
    abandonedCartEmailsDb.insert({ id: abandonedCartEmailsDb.nextId(), userId, email, cartValue, sentAt: new Date() });
  }

  async wasAbandonedCartEmailSent(userId: string, hoursAgo: number): Promise<boolean> {
    const threshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    return abandonedCartEmailsDb.count((e: any) => e.userId === userId && e.sentAt && new Date(e.sentAt) >= threshold) > 0;
  }
}

export const storage = new FileStorage();
