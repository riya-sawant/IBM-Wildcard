/**
 * In-memory access token store.
 *
 * The access token is kept here — NEVER in localStorage or sessionStorage.
 * This module is imported by the API helper and by the auth modal.
 */

let _accessToken = null;

export function setAccessToken(token) {
  _accessToken = token || null;
}

export function getAccessToken() {
  return _accessToken;
}

export function clearAccessToken() {
  _accessToken = null;
}

/**
 * Attempt a silent token refresh using the httpOnly refresh cookie.
 * Returns the new access token string, or null on failure.
 */
export async function silentRefresh() {
  try {
    const res = await fetch("http://localhost:5001/api/auth/refresh", {
      method:      "POST",
      credentials: "include",   // sends the httpOnly cookie automatically
      headers:     { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      clearAccessToken();
      return null;
    }

    const data = await res.json();
    if (data.accessToken) {
      setAccessToken(data.accessToken);
      return data.accessToken;
    }

    clearAccessToken();
    return null;
  } catch {
    clearAccessToken();
    return null;
  }
}

/**
 * Authenticated fetch wrapper.
 *
 * - Attaches the Bearer access token automatically.
 * - On 401, attempts one silent refresh and retries.
 * - Throws if still unauthorized after retry.
 */
export async function apiFetch(url, options = {}) {
  const token = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  // On 401, try to silently refresh then retry once.
  if (res.status === 401) {
    const newToken = await silentRefresh();
    if (newToken) {
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      return fetch(url, {
        ...options,
        credentials: "include",
        headers: retryHeaders,
      });
    }
    // Refresh failed — return the 401 so the caller can show the login modal.
    return res;
  }

  return res;
}
