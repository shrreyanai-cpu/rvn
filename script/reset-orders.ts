import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Starting database reset for transactional data...");
  try {
    // We execute a raw SQL query to TRUNCATE the transactional tables and RESTART IDENTITY
    // This removes all rows from the specified tables, and resets their auto-incrementing ID sequences (so the next insert starts at 1)
    // CASCADE ensures any related foreign keys are also deleted properly or bypassed.
    await db.execute(sql`
      TRUNCATE TABLE 
        orders, 
        cart_items, 
        return_requests, 
        reviews, 
        wishlists, 
        contact_messages, 
        admin_notifications, 
        abandoned_cart_emails 
      RESTART IDENTITY CASCADE;
    `);

    console.log("Successfully truncated orders, carts, returns, and other transactional tables.");
    console.log("The next order placed will be Order #1.");
    process.exit(0);
  } catch (err) {
    console.error("Error resetting database:", err);
    process.exit(1);
  }
}

run();
