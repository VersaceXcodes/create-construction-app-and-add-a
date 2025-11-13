import dotenv from "dotenv";
import fs from "fs";
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432 } = process.env;

const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { require: true } 
      }
    : {
        host: PGHOST || "ep-ancient-dream-abbsot9k-pooler.eu-west-2.aws.neon.tech",
        database: PGDATABASE || "neondb",
        user: PGUSER || "neondb_owner",
        password: PGPASSWORD || "npg_jAS3aITLC5DX",
        port: Number(PGPORT),
        ssl: { require: true },
      }
);


async function initDb() {
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Drop all existing tables in reverse order of dependencies
    console.log('Dropping existing tables...');
    const dropTablesQuery = `
      DROP TABLE IF EXISTS saved_carts CASCADE;
      DROP TABLE IF EXISTS recurring_orders CASCADE;
      DROP TABLE IF EXISTS back_in_stock_alerts CASCADE;
      DROP TABLE IF EXISTS price_drop_alerts CASCADE;
      DROP TABLE IF EXISTS supplier_inventory_alerts CASCADE;
      DROP TABLE IF EXISTS bank_accounts CASCADE;
      DROP TABLE IF EXISTS page_views CASCADE;
      DROP TABLE IF EXISTS search_analytics CASCADE;
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS platform_settings CASCADE;
      DROP TABLE IF EXISTS order_approvals CASCADE;
      DROP TABLE IF EXISTS approval_workflows CASCADE;
      DROP TABLE IF EXISTS supplier_followers CASCADE;
      DROP TABLE IF EXISTS user_preferences CASCADE;
      DROP TABLE IF EXISTS announcements CASCADE;
      DROP TABLE IF EXISTS canned_responses CASCADE;
      DROP TABLE IF EXISTS ticket_responses CASCADE;
      DROP TABLE IF EXISTS support_tickets CASCADE;
      DROP TABLE IF EXISTS showcase_comments CASCADE;
      DROP TABLE IF EXISTS showcase_likes CASCADE;
      DROP TABLE IF EXISTS project_showcases CASCADE;
      DROP TABLE IF EXISTS guide_ratings CASCADE;
      DROP TABLE IF EXISTS how_to_guides CASCADE;
      DROP TABLE IF EXISTS forum_likes CASCADE;
      DROP TABLE IF EXISTS forum_posts CASCADE;
      DROP TABLE IF EXISTS forum_threads CASCADE;
      DROP TABLE IF EXISTS secondary_marketplace_listings CASCADE;
      DROP TABLE IF EXISTS payout_line_items CASCADE;
      DROP TABLE IF EXISTS payouts CASCADE;
      DROP TABLE IF EXISTS credit_payments CASCADE;
      DROP TABLE IF EXISTS credit_invoices CASCADE;
      DROP TABLE IF EXISTS trade_credit_accounts CASCADE;
      DROP TABLE IF EXISTS trade_credit_applications CASCADE;
      DROP TABLE IF EXISTS promotion_usage CASCADE;
      DROP TABLE IF EXISTS promotions CASCADE;
      DROP TABLE IF EXISTS project_documents CASCADE;
      DROP TABLE IF EXISTS project_materials CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS conversations CASCADE;
      DROP TABLE IF EXISTS disputes CASCADE;
      DROP TABLE IF EXISTS refunds CASCADE;
      DROP TABLE IF EXISTS returns CASCADE;
      DROP TABLE IF EXISTS review_helpful_votes CASCADE;
      DROP TABLE IF EXISTS supplier_reviews CASCADE;
      DROP TABLE IF EXISTS product_reviews CASCADE;
      DROP TABLE IF EXISTS supplier_delivery_settings CASCADE;
      DROP TABLE IF EXISTS delivery_tracking_updates CASCADE;
      DROP TABLE IF EXISTS deliveries CASCADE;
      DROP TABLE IF EXISTS order_status_history CASCADE;
      DROP TABLE IF EXISTS inventory_movements CASCADE;
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS wishlist_items CASCADE;
      DROP TABLE IF EXISTS wishlists CASCADE;
      DROP TABLE IF EXISTS cart_items CASCADE;
      DROP TABLE IF EXISTS shopping_carts CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS product_images CASCADE;
      DROP TABLE IF EXISTS product_variants CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS payment_methods CASCADE;
      DROP TABLE IF EXISTS supplier_applications CASCADE;
      DROP TABLE IF EXISTS suppliers CASCADE;
      DROP TABLE IF EXISTS team_members CASCADE;
      DROP TABLE IF EXISTS business_accounts CASCADE;
      DROP TABLE IF EXISTS addresses CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `;
    await client.query(dropTablesQuery);
    console.log('Existing tables dropped successfully');
    
    // Read and split SQL commands
    const dbInitCommands = fs
      .readFileSync(`./db.sql`, "utf-8")
      .toString()
      .split(/(?=CREATE TABLE |INSERT INTO)/);

    // Execute each command
    for (let cmd of dbInitCommands) {
      if (cmd.trim()) {
        console.dir({ "backend:db:init:command": cmd.substring(0, 100) + '...' });
        await client.query(cmd);
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('Database initialization completed successfully');
  } catch (e) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', e);
    throw e;
  } finally {
    // Release client back to pool
    client.release();
  }
}

// Execute initialization
initDb().catch(console.error);
