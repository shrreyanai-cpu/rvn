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
  material: text("material"),
  inStock: boolean("in_stock").notNull().default(true),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
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
  deliveryCharge: numeric("delivery_charge", { precision: 10, scale: 2 }).default("0"),
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
