import { type User, type UpsertUser, users } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (userData.id) {
      const [existing] = await db.select().from(users).where(eq(users.id, userData.id));
      if (existing) {
        const [updated] = await db.update(users).set({ ...userData, updatedAt: new Date() }).where(eq(users.id, userData.id)).returning();
        return updated;
      }
    }
    if (userData.email) {
      const [existingByEmail] = await db.select().from(users).where(eq(users.email, userData.email));
      if (existingByEmail) {
        const [updated] = await db.update(users).set({ ...userData, updatedAt: new Date() }).where(eq(users.id, existingByEmail.id)).returning();
        return updated;
      }
    }

    const [user] = await db.insert(users).values({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return updated;
  }
}

export const authStorage = new AuthStorage();
