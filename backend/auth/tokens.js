/**
 * JWT helpers — issue and verify access/refresh tokens.
 *
 * Access token:  15 minutes, signed with JWT_ACCESS_SECRET.
 * Refresh token: 7 days,     signed with JWT_REFRESH_SECRET.
 *
 * Both use the HS256 algorithm explicitly.  The algorithm is checked on
 * verification to prevent algorithm-confusion attacks (e.g. "alg: none").
 */
import jwt from "jsonwebtoken";

const ACCESS_TTL  = 15 * 60;          // 15 minutes (seconds)
const REFRESH_TTL = 7  * 24 * 3600;   // 7 days    (seconds)
const ALGORITHM   = "HS256";

function accessSecret() {
  const s = process.env.JWT_ACCESS_SECRET;
  if (!s) throw new Error("JWT_ACCESS_SECRET is not set");
  return s;
}

function refreshSecret() {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s) throw new Error("JWT_REFRESH_SECRET is not set");
  return s;
}

/**
 * Issue a short-lived access token containing only the user's id.
 * @param {string} userId - UUID from the users table
 */
export function issueAccessToken(userId) {
  return jwt.sign(
    { sub: userId },
    accessSecret(),
    { algorithm: ALGORITHM, expiresIn: ACCESS_TTL }
  );
}

/**
 * Issue a longer-lived refresh token.
 * Returns { token, expiresAt } where expiresAt is a Date object.
 * @param {string} userId
 */
export function issueRefreshToken(userId) {
  const expiresAt = new Date(Date.now() + REFRESH_TTL * 1000);
  const token = jwt.sign(
    { sub: userId },
    refreshSecret(),
    { algorithm: ALGORITHM, expiresIn: REFRESH_TTL }
  );
  return { token, expiresAt };
}

/**
 * Verify and decode an access token.
 * Throws on invalid / expired / wrong-algorithm tokens.
 * @param {string} token
 * @returns {{ sub: string }} decoded payload
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret(), { algorithms: [ALGORITHM] });
}

/**
 * Verify and decode a refresh token.
 * Throws on invalid / expired / wrong-algorithm tokens.
 * @param {string} token
 * @returns {{ sub: string }} decoded payload
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret(), { algorithms: [ALGORITHM] });
}
