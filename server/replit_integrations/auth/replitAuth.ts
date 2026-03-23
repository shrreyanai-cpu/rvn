import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../../db";

export function getSession() {
  const PgStore = connectPgSimple(session);
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  
  const isDev = process.env.NODE_ENV === "development" || process.env.FORCE_DEV === "true";
  
  const sessionSettings = {
    store: new PgStore({
      pool,
      tableName: "sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "fallback-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      // If we are in Dev or explicitly forcing dev mode, don't use secure cookies (so it works on localhost HTTP)
      secure: !isDev && (process.env.NODE_ENV === "production" || process.env.REPLIT_SIDECAR_ENDPOINT !== undefined),
      maxAge: sessionTtl,
      sameSite: "lax" as const,
    },
  };

  // Log the configuration for debugging
  const isSecure = sessionSettings.cookie.secure;
  console.log(`[Session] Initializing session. env=${process.env.NODE_ENV}, isDev=${isDev}, secure=${isSecure}`);
  return session(sessionSettings);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if ((req.session as any)?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
