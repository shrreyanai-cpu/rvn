import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, numeric, boolean, timestamp, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  parentId: integer("parent_id"),
});

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  children: many(categories, { relationName: "parentChild" }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parentChild",
  }),
}));

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id").references(() => categories.id),
  images: text("images").array().notNull().default(sql`'{}'::text[]`),
  sizes: text("sizes").array().notNull().default(sql`'{}'::text[]`),
  colors: text("colors").array().notNull().default(sql`'{}'::text[]`),
  sku: text("sku").unique(),
  material: text("material"),
  brand: text("brand"),
  inStock: boolean("in_stock").notNull().default(true),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  weight: integer("weight").notNull().default(0),
  flashSalePrice: numeric("flash_sale_price", { precision: 10, scale: 2 }),
  flashSaleStart: timestamp("flash_sale_start"),
  flashSaleEnd: timestamp("flash_sale_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  size: text("size"),
  color: text("color"),
  addedAt: timestamp("added_at").defaultNow(),
  whatsappNotifiedAt: timestamp("whatsapp_notified_at"),
});

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  items: jsonb("items").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentMethod: text("payment_method").default("cashfree"),
  cashfreeOrderId: text("cashfree_order_id"),
  razorpayOrderId: text("razorpay_order_id"),
  deliveryCharge: numeric("delivery_charge", { precision: 10, scale: 2 }).default("0"),
  packageLength: numeric("package_length", { precision: 10, scale: 2 }),
  packageWidth: numeric("package_width", { precision: 10, scale: 2 }),
  packageHeight: numeric("package_height", { precision: 10, scale: 2 }),
  packageWeight: numeric("package_weight", { precision: 10, scale: 2 }),
  delhiveryWaybill: text("delhivery_waybill"),
  delhiveryStatus: text("delhivery_status"),
  trackingUrl: text("tracking_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type OrderItem = {
  productId: number;
  name: string;
  price: string;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string;
  weight?: number;
};

export type ShippingAddress = {
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  label: text("label").default("Home"),
  fullName: text("full_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  phone: text("phone").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true });
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addresses.$inferSelect;

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").notNull().default("percentage"),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }),
  maxDiscount: numeric("max_discount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, usedCount: true, createdAt: true });
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

export const deliverySettings = pgTable("delivery_settings", {
  id: serial("id").primaryKey(),
  freeDeliveryEnabled: boolean("free_delivery_enabled").notNull().default(true),
  freeDeliveryThreshold: numeric("free_delivery_threshold", { precision: 10, scale: 2 }),
  flatDeliveryCharge: numeric("flat_delivery_charge", { precision: 10, scale: 2 }).default("0"),
  perKgCharge: numeric("per_kg_charge", { precision: 10, scale: 2 }).default("0"),
  delhiveryApiToken: text("delhivery_api_token"),
  delhiveryWarehouseName: text("delhivery_warehouse_name"),
  delhiveryPickupPincode: text("delhivery_pickup_pincode"),
  delhiveryPickupAddress: text("delhivery_pickup_address"),
  delhiveryPickupCity: text("delhivery_pickup_city"),
  delhiveryPickupState: text("delhivery_pickup_state"),
  delhiveryPickupPhone: text("delhivery_pickup_phone"),
  delhiveryEnvironment: text("delhivery_environment").default("staging"),
  sellerName: text("seller_name"),
  sellerGstTin: text("seller_gst_tin"),
  whatsappNotifyNumber: text("whatsapp_notify_number"),
  whatsappOrderNotifications: boolean("whatsapp_order_notifications").default(true),
  whatsappAbandonedCartEnabled: boolean("whatsapp_abandoned_cart_enabled").default(true),
  whatsappAbandonedCartMinutes: integer("whatsapp_abandoned_cart_minutes").default(30),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type DeliverySettings = typeof deliverySettings.$inferSelect;
export type InsertDeliverySettings = typeof deliverySettings.$inferInsert;

export const returnRequests = pgTable("return_requests", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  userId: varchar("user_id").notNull(),
  reason: text("reason").notNull(),
  damageVideoUrl: text("damage_video_url").notNull(),
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReturnRequestSchema = createInsertSchema(returnRequests).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReturnRequest = z.infer<typeof insertReturnRequestSchema>;
export type ReturnRequest = typeof returnRequests.$inferSelect;

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(),
  title: text("title"),
  comment: text("comment"),
  images: text("images").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, createdAt: true });
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

export const instagramPosts = pgTable("instagram_posts", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  postUrl: text("post_url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInstagramPostSchema = createInsertSchema(instagramPosts).omit({ id: true, createdAt: true });
export type InsertInstagramPost = z.infer<typeof insertInstagramPostSchema>;
export type InstagramPost = typeof instagramPosts.$inferSelect;

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, isRead: true, createdAt: true });
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export const adminNotifications = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  orderId: integer("order_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminNotificationSchema = createInsertSchema(adminNotifications).omit({ id: true, isRead: true, createdAt: true });
export type InsertAdminNotification = z.infer<typeof insertAdminNotificationSchema>;
export type AdminNotification = typeof adminNotifications.$inferSelect;

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

export const insertWishlistSchema = createInsertSchema(wishlists).omit({ id: true, createdAt: true });
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlists.$inferSelect;

export const seasonalBanners = pgTable("seasonal_banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  bgColor: text("bg_color").default("#C9A961"),
  textColor: text("text_color").default("#FFFFFF"),
  isActive: boolean("is_active").notNull().default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  sortOrder: integer("sort_order").notNull().default(0),
  displayType: text("display_type").notNull().default("bar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSeasonalBannerSchema = createInsertSchema(seasonalBanners).omit({ id: true, createdAt: true });
export type InsertSeasonalBanner = z.infer<typeof insertSeasonalBannerSchema>;
export type SeasonalBanner = typeof seasonalBanners.$inferSelect;

export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  cashfreeEnabled: boolean("cashfree_enabled").notNull().default(true),
  razorpayEnabled: boolean("razorpay_enabled").notNull().default(false),
  codEnabled: boolean("cod_enabled").notNull().default(false),
  razorpayKeyId: text("razorpay_key_id"),
  razorpayKeySecret: text("razorpay_key_secret"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentSettingsSchema = createInsertSchema(paymentSettings).omit({ id: true, updatedAt: true });
export type InsertPaymentSettings = z.infer<typeof insertPaymentSettingsSchema>;
export type PaymentSettings = typeof paymentSettings.$inferSelect;

export const abandonedCartEmails = pgTable("abandoned_cart_emails", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  email: text("email").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  cartValue: numeric("cart_value", { precision: 10, scale: 2 }),
});
