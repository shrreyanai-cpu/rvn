import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  role: varchar("role").default("customer"),
  emailVerified: boolean("email_verified").default(false),
  savedShippingAddress: jsonb("saved_shipping_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailVerifications = pgTable("email_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  otp: varchar("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  attempts: integer("attempts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResets = pgTable("password_resets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const ROLES = ["super_admin", "manager", "staff", "customer"] as const;
export type Role = typeof ROLES[number];

export const PERMISSIONS = [
  "view_dashboard",
  "manage_products",
  "view_orders",
  "manage_orders",
  "view_customers",
  "manage_customers",
  "manage_categories",
  "manage_coupons",
  "manage_delivery",
  "manage_roles",
] as const;
export type Permission = typeof PERMISSIONS[number];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "view_dashboard",
    "manage_products",
    "view_orders",
    "manage_orders",
    "view_customers",
    "manage_customers",
    "manage_categories",
    "manage_coupons",
    "manage_delivery",
    "manage_roles",
  ],
  manager: [
    "view_dashboard",
    "manage_products",
    "view_orders",
    "manage_orders",
    "view_customers",
    "manage_customers",
    "manage_categories",
    "manage_coupons",
    "manage_delivery",
  ],
  staff: [
    "view_dashboard",
    "view_orders",
    "manage_orders",
    "view_customers",
  ],
  customer: [],
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  manager: "Manager",
  staff: "Staff",
  customer: "Customer",
};

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  const r = (role || "customer") as Role;
  if (!(r in ROLE_PERMISSIONS)) return false;
  return ROLE_PERMISSIONS[r].includes(permission);
}

export function isAdminRole(role: string | null | undefined): boolean {
  const r = (role || "customer") as Role;
  return r === "super_admin" || r === "manager" || r === "staff";
}
