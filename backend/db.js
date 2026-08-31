/**
 * PostgreSQL connection pool.
 *
 * Supports two configuration styles — use whichever matches your setup:
 *
 *   Option A — connection string (recommended for most cloud providers):
 *     DATABASE_URL=postgresql://user:password@host:5432/dbname
 *
 *   Option B — individual variables (easier for local dev, avoids
 *   URL-encoding special characters in passwords):
 *     DB_HOST=localhost
 *     DB_PORT=5432
 *     DB_NAME=novahealth
 *     DB_USER=postgres
 *     DB_PASSWORD=yourpassword
 *
 * Option A takes precedence when DATABASE_URL is set to a non-placeholder value.
 * All credentials stay server-side — never logged, never sent to the client.
 */
import pg from "pg";

const { Pool } = pg;

// ── Detect the placeholder value left by setup scripts ──────────────────────
// The placeholder is:  postgresql://localhost:5432/novahealth
// (no user, no password — causes a SASL auth error if passed to pg)
const PLACEHOLDER_URL = "postgresql://localhost:5432/novahealth";

function buildPoolConfig() {
  const url = process.env.DATABASE_URL;
  const isRealUrl =
    url &&
    url.trim() !== "" &&
    url.trim() !== PLACEHOLDER_URL &&
    // Must contain @ meaning it has user[:password]@host
    url.includes("@");

  if (isRealUrl) {
    // Option A — full connection string
    return {
      connectionString: url.trim(),
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    };
  }

  // Option B — individual variables
  const host     = process.env.DB_HOST     || "localhost";
  const port     = parseInt(process.env.DB_PORT || "5432", 10);
  const database = process.env.DB_NAME     || "novahealth";
  const user     = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!user || !password) {
    // Give a clear startup error instead of a cryptic SASL message.
    throw new Error(
      "Database is not configured. " +
      "Set DATABASE_URL (e.g. postgresql://user:password@localhost:5432/novahealth) " +
      "or set DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD in backend/.env"
    );
  }

  return {
    host,
    port,
    database,
    user,
    password: String(password),   // pg requires password to be a string
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  };
}

const pool = new Pool({
  ...buildPoolConfig(),
  max:                    10,
  idleTimeoutMillis:      30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  // Log connection-level errors without leaking credentials.
  console.error("[db] Unexpected pool error:", err.message);
});

export default pool;
