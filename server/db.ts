import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const rawConnectionString = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error(
    "DATABASE_URL or EXTERNAL_DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function parseDbUrl(url: string) {
  try {
    new URL(url);
    return { connectionString: url };
  } catch {
    const match = url.match(/^postgresql:\/\/([^:]+):(.+)@([^/]+)\/(.+)$/);
    if (match) {
      const [, user, password, host, database] = match;
      const encodedPassword = encodeURIComponent(password);
      return { connectionString: `postgresql://${user}:${encodedPassword}@${host}/${database}` };
    }
    return { connectionString: url };
  }
}

const { connectionString } = parseDbUrl(rawConnectionString);
const isExternal = !!process.env.EXTERNAL_DATABASE_URL;
export const pool = new Pool({
  connectionString,
  ...(isExternal ? { ssl: { rejectUnauthorized: false } } : {}),
});
export const db = drizzle(pool, { schema });
