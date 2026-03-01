import { type User, type UpsertUser } from "@shared/models/auth";
import { JsonCollection } from "../../file-db";
import crypto from "crypto";

const usersDb = new JsonCollection<any>("users");

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    return usersDb.getById(id) as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return usersDb.findOne((u) => u.email === email) as User | undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (userData.id) {
      const existing = usersDb.getById(userData.id);
      if (existing) {
        const updated = usersDb.update(userData.id, { ...userData, updatedAt: new Date() });
        return updated as User;
      }
    }
    const existingByEmail = userData.email ? usersDb.findOne((u: any) => u.email === userData.email) : null;
    if (existingByEmail) {
      const updated = usersDb.update(existingByEmail.id, { ...userData, updatedAt: new Date() });
      return updated as User;
    }

    const user = {
      id: userData.id || crypto.randomUUID(),
      email: userData.email || null,
      password: userData.password || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: (userData as any).profileImageUrl || null,
      isAdmin: (userData as any).isAdmin || false,
      role: (userData as any).role || "customer",
      phone: (userData as any).phone || null,
      emailVerified: (userData as any).emailVerified || false,
      savedShippingAddress: (userData as any).savedShippingAddress || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return usersDb.insert(user) as User;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const updated = usersDb.update(id, { ...data, updatedAt: new Date() });
    return updated as User | undefined;
  }
}

export const authStorage = new AuthStorage();
