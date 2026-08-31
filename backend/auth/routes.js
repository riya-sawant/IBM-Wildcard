/**
 * Authentication routes.
 *
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/refresh
 * POST /api/auth/logout
 */
import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import pool from "../db.js";
import {
  issueAccessToken,
  issueRefreshToken,
  verifyRefreshToken,
} from "./tokens.js";

const router = Router();

// ─── Constants ────────────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;

// Minimum/maximum password constraints (enforced server-side only).
const PASSWORD_MIN   = 8;
const PASSWORD_MAX   = 128;
const EMAIL_MAX      = 254; // RFC 5321 limit

// Refresh-cookie settings.
const REFRESH_COOKIE_NAME = "nova_refresh";
const REFRESH_TTL_DAYS    = 7;

function refreshCookieOptions(expiresAt) {
  return {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === "production",
    sameSite:  "strict",
    path:      "/api/auth",          // only sent to auth endpoints
    expires:   expiresAt,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize email: trim + lowercase */
function normalizeEmail(raw) {
  return (raw || "").trim().toLowerCase();
}

/** Basic RFC-5322 email validation (good enough for a server check). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return (
    typeof email === "string" &&
    email.length <= EMAIL_MAX &&
    EMAIL_RE.test(email)
  );
}

/** Returns a string describing the first password rule violation, or null. */
function passwordError(password) {
  if (typeof password !== "string")         return "Password is required.";
  if (password.length < PASSWORD_MIN)       return `Password must be at least ${PASSWORD_MIN} characters.`;
  if (password.length > PASSWORD_MAX)       return `Password must be at most ${PASSWORD_MAX} characters.`;
  // Require at least one letter and one digit for reasonable complexity.
  if (!/[a-zA-Z]/.test(password))          return "Password must contain at least one letter.";
  if (!/[0-9]/.test(password))             return "Password must contain at least one number.";
  return null;
}

/**
 * Hash a token with SHA-256 for storage.
 * We never store the raw refresh token in the database.
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Persist a new refresh token (hashed) and return its DB row id. */
async function storeRefreshToken(userId, rawToken, expiresAt) {
  const hash = hashToken(rawToken);
  const result = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, hash, expiresAt]
  );
  return result.rows[0].id;
}

/** Lookup a stored (hashed) refresh token. Returns the row or null. */
async function findRefreshToken(rawToken) {
  const hash = hashToken(rawToken);
  const result = await pool.query(
    `SELECT id, user_id, expires_at
       FROM refresh_tokens
      WHERE token_hash = $1`,
    [hash]
  );
  return result.rows[0] || null;
}

/** Delete a single refresh token by its DB id. */
async function deleteRefreshToken(rowId) {
  await pool.query(`DELETE FROM refresh_tokens WHERE id = $1`, [rowId]);
}

/** Delete all refresh tokens belonging to a user (full logout). */
async function deleteAllRefreshTokens(userId) {
  await pool.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { email, password }
 */
router.post("/register", async (req, res) => {
  const { email: rawEmail, password } = req.body || {};

  const email = normalizeEmail(rawEmail);

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }

  const pwErr = passwordError(password);
  if (pwErr) {
    return res.status(400).json({ error: pwErr });
  }

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash]
    );

    const user = result.rows[0];

    // Issue tokens immediately after registration so the user is logged in.
    const accessToken              = issueAccessToken(user.id);
    const { token: rawRefresh, expiresAt } = issueRefreshToken(user.id);
    await storeRefreshToken(user.id, rawRefresh, expiresAt);

    res.cookie(
      REFRESH_COOKIE_NAME,
      rawRefresh,
      refreshCookieOptions(expiresAt)
    );

    // Never return password_hash.
    return res.status(201).json({
      accessToken,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    // PostgreSQL unique-constraint violation code is 23505.
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ error: "An account with that email already exists." });
    }
    // Don't leak database details.
    console.error("[auth] Registration error:", err.message);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  const { email: rawEmail, password } = req.body || {};

  const email = normalizeEmail(rawEmail);

  if (!isValidEmail(email) || typeof password !== "string" || !password) {
    // Generic — never reveal which field failed to prevent enumeration.
    return res.status(401).json({ error: "Invalid email or password." });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, password_hash FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    // Always run bcrypt even on a missing user to prevent timing attacks.
    // Use a dummy hash so the comparison takes the same time.
    const DUMMY_HASH =
      "$2b$12$invalidhashplaceholder.for.timing.protection.only.XXXX";
    const hashToCompare = user ? user.password_hash : DUMMY_HASH;

    const match = await bcrypt.compare(password, hashToCompare);

    if (!user || !match) {
      // Generic — never say "email not found" or "wrong password".
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const accessToken                     = issueAccessToken(user.id);
    const { token: rawRefresh, expiresAt } = issueRefreshToken(user.id);
    await storeRefreshToken(user.id, rawRefresh, expiresAt);

    res.cookie(
      REFRESH_COOKIE_NAME,
      rawRefresh,
      refreshCookieOptions(expiresAt)
    );

    return res.json({
      accessToken,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error("[auth] Login error:", err.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

/**
 * POST /api/auth/refresh
 * Reads refresh token from httpOnly cookie only — NOT from request body.
 * Issues a new access token and rotates the refresh token.
 */
router.post("/refresh", async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!rawToken) {
    return res.status(401).json({ error: "No refresh token." });
  }

  // Step 1: verify JWT signature & expiry.
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    // Invalid / expired JWT — clear the cookie.
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }

  // Step 2: verify the token exists in our database (i.e., wasn't revoked).
  try {
    const row = await findRefreshToken(rawToken);

    if (!row || row.user_id !== payload.sub) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
      return res.status(401).json({ error: "Session invalid. Please log in again." });
    }

    // Step 3: Rotate — delete old token, issue a new one.
    await deleteRefreshToken(row.id);

    const newAccessToken                     = issueAccessToken(payload.sub);
    const { token: newRawRefresh, expiresAt } = issueRefreshToken(payload.sub);
    await storeRefreshToken(payload.sub, newRawRefresh, expiresAt);

    res.cookie(
      REFRESH_COOKIE_NAME,
      newRawRefresh,
      refreshCookieOptions(expiresAt)
    );

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("[auth] Refresh error:", err.message);
    return res.status(500).json({ error: "Could not refresh session." });
  }
});

/**
 * POST /api/auth/logout
 * Revokes the stored refresh token and clears the cookie.
 */
router.post("/logout", async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (rawToken) {
    try {
      // Best-effort revocation — don't error if the token is already gone.
      const row = await findRefreshToken(rawToken);
      if (row) await deleteRefreshToken(row.id);
    } catch (err) {
      console.error("[auth] Logout revocation error:", err.message);
    }
  }

  // Clear the cookie regardless of whether revocation succeeded.
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });

  return res.json({ message: "Logged out." });
});

export default router;
