import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const externalUrl = process.env.EXTERNAL_DATABASE_URL;
const databaseUrl = process.env.DATABASE_URL;

if (!externalUrl && !databaseUrl) {
  throw new Error(
    "DATABASE_URL or EXTERNAL_DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function buildPoolConfig() {
  if (externalUrl) {
    try {
      const url = new URL(externalUrl);
      return {
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1),
      };
    } catch {
      return { connectionString: externalUrl };
    }
  }
  return { connectionString: databaseUrl! };
}

export const pool = new Pool(buildPoolConfig());
export const db = drizzle(pool, { schema });
