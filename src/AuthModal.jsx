/**
 * AuthModal — Login / Register modal.
 *
 * - Access token is stored in memory only via auth.js
 * - Refresh token is an httpOnly cookie — never touched by JS
 * - No credentials go to localStorage / sessionStorage
 */
import React, { useState } from "react";
import { setAccessToken } from "./auth.js";

const API = "http://localhost:5001";

export default function AuthModal({ t, onAuthenticated, onClose }) {
  const [mode,     setMode]     = useState("login");   // "login" | "register"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login"
      ? `${API}/api/auth/login`
      : `${API}/api/auth/register`;

    try {
      const res = await fetch(endpoint, {
        method:      "POST",
        credentials: "include",          // allows the httpOnly cookie to be set
        headers:     { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      // Store the access token in memory only — never in localStorage.
      setAccessToken(data.accessToken);
      onAuthenticated(data.user);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const overlayStyle = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  };
  const boxStyle = {
    background: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: 14,
    padding: "32px 28px",
    width: "100%",
    maxWidth: 360,
    boxSizing: "border-box",
  };
  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    fontSize: 14,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    background: t.panel,
    color: t.ink,
    outline: "none",
    boxSizing: "border-box",
  };
  const btnStyle = {
    width: "100%",
    padding: "10px 0",
    background: t.accent,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose?.(); }}>
      <div style={boxStyle}>
        <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: t.ink }}>
          {mode === "login" ? "Sign in to Nova" : "Create an account"}
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: t.sub }}>
          {mode === "login"
            ? "Sign in to access AI-powered health guidance."
            : "Create an account to use Nova's AI features."}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder={mode === "register" ? "Password (min 8 chars, 1 letter, 1 number)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            style={inputStyle}
          />

          {error && (
            <p style={{ margin: 0, fontSize: 13, color: t.coral, padding: "6px 10px", background: t.coralBg, borderRadius: 6 }}>
              {error}
            </p>
          )}

          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p style={{ margin: "16px 0 0", fontSize: 13, color: t.sub, textAlign: "center" }}>
          {mode === "login" ? (
            <>Don&apos;t have an account?{" "}
              <button onClick={() => { setMode("register"); setError(""); }}
                style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0 }}>
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(""); }}
                style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0 }}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
