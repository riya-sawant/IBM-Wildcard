/**
 * Database migration — runs once at startup.
 * Creates tables if they don't already exist.
 */
import pool from "./db.js";

export async function runMigrations() {
  // Probe the connection first so misconfiguration gives a readable error
  // instead of a cryptic SASL/SCRAM message from deep inside pg.
  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    if (
      err.message.includes("SASL") ||
      err.message.includes("password") ||
      err.message.includes("authentication") ||
      err.message.includes("ECONNREFUSED")
    ) {
      throw new Error(
        "[db] Cannot connect to PostgreSQL. " +
        "Check DATABASE_URL (or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD) in backend/.env. " +
        "Cause: " + err.message
      );
    }
    throw err;
  }

  try {
    await client.query("BEGIN");

    // Users table — password is stored as bcrypt hash only, never plaintext.
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email       TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Index to speed up email lookups on login.
    await client.query(`
      CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
    `);

    // Refresh tokens — we store a SHA-256 hash of the raw token so that even
    // if this table is compromised the raw tokens cannot be replayed without
    // also compromising the JWT_REFRESH_SECRET.
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash  TEXT NOT NULL UNIQUE,
        expires_at  TIMESTAMPTZ NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON refresh_tokens (user_id);
    `);

    // Purge expired tokens periodically via this index.
    await client.query(`
      CREATE INDEX IF NOT EXISTS refresh_tokens_expires_idx ON refresh_tokens (expires_at);
    `);

    await client.query("COMMIT");
    console.log("[migrate] Schema up to date.");
  } catch (err) {
    await client.query("ROLLBACK");
    // Re-throw so the server aborts on a broken schema.
    throw new Error(`[migrate] Migration failed: ${err.message}`);
  } finally {
    client.release();
  }
}
