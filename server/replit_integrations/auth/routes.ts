import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../../db";
import { emailVerifications } from "@shared/models/auth";
import { eq, and, gt, desc } from "drizzle-orm";
import { sendOtpEmail } from "../../email";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const MAX_OTP_ATTEMPTS = 5;
const OTP_COOLDOWN_MS = 60 * 1000;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function invalidateOldOtps(email: string) {
  await db
    .update(emailVerifications)
    .set({ used: true })
    .where(and(eq(emailVerifications.email, email), eq(emailVerifications.used, false)));
}

async function canSendOtp(email: string): Promise<boolean> {
  const [recent] = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.email, email))
    .orderBy(desc(emailVerifications.createdAt))
    .limit(1);
  if (!recent || !recent.createdAt) return true;
  return Date.now() - new Date(recent.createdAt).getTime() > OTP_COOLDOWN_MS;
}

async function createAndSendOtp(email: string): Promise<boolean> {
  await invalidateOldOtps(email);
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db.insert(emailVerifications).values({ email, otp, expiresAt });
  const result = await sendOtpEmail(email, otp);
  return !!result;
}

export function registerAuthRoutes(app: Express): void {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid email or password format" });
      }
      const { email, password } = parsed.data;
      const user = await authStorage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (!user.emailVerified) {
        const allowed = await canSendOtp(email);
        if (allowed) {
          await createAndSendOtp(email);
        }
        return res.status(403).json({
          message: "Email not verified",
          requiresVerification: true,
          email,
        });
      }
      (req.session as any).userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid registration data", errors: parsed.error.flatten() });
      }
      const { email, password, firstName, lastName } = parsed.data;
      const existing = await authStorage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      await authStorage.upsertUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerified: false,
      });
      await createAndSendOtp(email);
      res.json({ requiresVerification: true, email });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        otp: z.string().length(6),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid verification data" });
      }
      const { email, otp } = parsed.data;
      const now = new Date();

      const [activeOtp] = await db
        .select()
        .from(emailVerifications)
        .where(
          and(
            eq(emailVerifications.email, email),
            eq(emailVerifications.used, false),
            gt(emailVerifications.expiresAt, now)
          )
        )
        .orderBy(desc(emailVerifications.createdAt))
        .limit(1);

      if (!activeOtp) {
        return res.status(400).json({ message: "No active verification code found. Please request a new one." });
      }

      if ((activeOtp.attempts || 0) >= MAX_OTP_ATTEMPTS) {
        await db
          .update(emailVerifications)
          .set({ used: true })
          .where(eq(emailVerifications.id, activeOtp.id));
        return res.status(429).json({ message: "Too many attempts. Please request a new code." });
      }

      if (activeOtp.otp !== otp) {
        await db
          .update(emailVerifications)
          .set({ attempts: (activeOtp.attempts || 0) + 1 })
          .where(eq(emailVerifications.id, activeOtp.id));
        const remaining = MAX_OTP_ATTEMPTS - (activeOtp.attempts || 0) - 1;
        return res.status(400).json({
          message: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
        });
      }

      await db
        .update(emailVerifications)
        .set({ used: true })
        .where(eq(emailVerifications.id, activeOtp.id));

      const user = await authStorage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await authStorage.updateUser(user.id, { emailVerified: true });

      (req.session as any).userId = user.id;
      const { password: _, ...safeUser } = { ...user, emailVerified: true };
      res.json(safeUser);
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const schema = z.object({ email: z.string().email() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid email" });
      }
      const { email } = parsed.data;
      const user = await authStorage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }
      const allowed = await canSendOtp(email);
      if (!allowed) {
        return res.status(429).json({ message: "Please wait before requesting a new code" });
      }
      const sent = await createAndSendOtp(email);
      if (!sent) {
        return res.status(500).json({ message: "Failed to send verification code" });
      }
      res.json({ message: "Verification code sent" });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ message: "Failed to resend code" });
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
}
