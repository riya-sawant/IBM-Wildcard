/**
 * requireAuth middleware.
 *
 * Reads the Bearer access token from the Authorization header,
 * verifies signature + expiry + algorithm, and attaches
 * req.user = { id: <uuid> } for downstream handlers.
 *
 * Never exposes JWT internals through error responses.
 */
import { verifyAccessToken } from "./tokens.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ error: "Authentication required." });
  }

  try {
    const payload = verifyAccessToken(token);
    // Attach only the user id — nothing else from the token payload.
    req.user = { id: payload.sub };
    next();
  } catch {
    // Expired, invalid signature, wrong algorithm, etc.
    return res
      .status(401)
      .json({ error: "Invalid or expired session. Please log in again." });
  }
}
