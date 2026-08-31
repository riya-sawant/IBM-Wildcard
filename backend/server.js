/**
 * NovaHealth backend — production-grade server.
 *
 * Security layers applied (in order of middleware chain):
 *   1. Helmet     — secure HTTP headers
 *   2. CORS       — restricted to FRONTEND_ORIGIN, credentials allowed
 *   3. cookie-parser — required for httpOnly refresh cookie
 *   4. Body limits — prevents payload abuse
 *   5. Rate limiting on auth endpoints
 *   6. Input validation on every route
 *   7. requireAuth on /api/chat, /api/analyze-photo, /api/voice-summary
 *   8. Centralized error handler (never leaks internals)
 */

import "dotenv/config";
import cors         from "cors";
import express      from "express";
import helmet       from "helmet";
import cookieParser from "cookie-parser";
import rateLimit    from "express-rate-limit";
import Groq         from "groq-sdk";

import pool              from "./db.js";
import { runMigrations } from "./migrate.js";
import authRouter        from "./auth/routes.js";
import { requireAuth }   from "./auth/middleware.js";

// ─── Environment validation ───────────────────────────────────────────────────

function validateEnvironment() {
  // Hard-required: server cannot function at all without these.
  const required = [
    "DATABASE_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "WATSONX_API_KEY",
    "WATSONX_SPACE_ID",
    "WATSONX_URL",
    "WATSONX_MODEL_ID",
    "GROQ_API_KEY",
    "FRONTEND_ORIGIN",
  ];

  const missing = required.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

// ─── App setup ────────────────────────────────────────────────────────────────

const app  = express();
const PORT = process.env.PORT || 5001;

// Trust the first reverse-proxy hop so that express-rate-limit sees real IPs.
// Remove this line if there is no proxy in front of the app.
app.set("trust proxy", 1);

// ── 1. Security headers ──────────────────────────────────────────────────────
app.use(
  helmet({
    // CSP is intentionally left to defaults for now; the frontend is a
    // separate Vite dev server so the backend only serves API routes.
    contentSecurityPolicy: false,
  })
);

// ── 2. CORS ───────────────────────────────────────────────────────────────────
// credentials: true is required for the httpOnly refresh cookie to be sent.
// origin must be explicit (never "*") when credentials are involved.
app.use(
  cors({
    origin:      process.env.FRONTEND_ORIGIN,
    credentials: true,
    methods:     ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── 3. Cookie parser ─────────────────────────────────────────────────────────
app.use(cookieParser());

// ── 4. Body limits ───────────────────────────────────────────────────────────
// 512 KB is generous for a chat payload; prevents unbounded uploads.
app.use(express.json({ limit: "512kb" }));

// ─── Rate limiters ────────────────────────────────────────────────────────────

/** Strict limiter for login/register: 10 attempts per 15 minutes per IP. */
const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: "Too many attempts. Please try again in 15 minutes." },
  // Skip successful requests so only failures consume quota.
  skipSuccessfulRequests: true,
});

/** Lighter limiter for chat endpoints: 60 requests per minute per IP. */
const chatLimiter = rateLimit({
  windowMs:         60 * 1000,
  max:              60,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: "Too many requests. Please slow down." },
});

// ─── Groq client ─────────────────────────────────────────────────────────────
// Initialized lazily so validateEnvironment() runs first.
// The API key is read only from process.env — never hardcoded or logged.
let _groqClient = null;
function getGroqClient() {
  if (!_groqClient) {
    _groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groqClient;
}

// ─── IBM IAM token cache ──────────────────────────────────────────────────────

const TOKEN_URL     = "https://iam.cloud.ibm.com/identity/token";
let   cachedToken   = null;
let   tokenExpiresAt = 0;

async function getIBMAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const body = new URLSearchParams({
    grant_type: "urn:ibm:params:oauth:grant-type:apikey",
    apikey:     process.env.WATSONX_API_KEY,
  });

  const res = await fetch(TOKEN_URL, {
    method:  "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error(
      data?.errorMessage || data?.error_description || "IBM IAM authentication failed."
    );
  }

  cachedToken     = data.access_token;
  const expiresIn = data.expires_in || 3600;
  tokenExpiresAt  = Date.now() + Math.max(60, expiresIn - 120) * 1000;

  return cachedToken;
}

// ─── System prompts ───────────────────────────────────────────────────────────

const COMMON_SAFETY_PROMPT = `
You are Nova, a warm, plain-language healthcare navigation assistant.

You provide general educational and healthcare-navigation information.
You do not provide medical diagnoses, prescriptions, legal advice, or guaranteed
insurance coverage.

Never:
- Diagnose a medical condition.
- Prescribe medication.
- Tell a user to stop or change medication.
- Guarantee that Medicare or insurance will cover something.
- Request Social Security numbers, Medicare numbers, insurance member IDs,
  medical record numbers, passwords, or payment information.

If the user reports severe difficulty breathing, chest pain, signs of a stroke,
heavy uncontrolled bleeding, loss of consciousness, suicidal thoughts, or
another possible emergency, tell them to call 911 or their local emergency
number immediately.

Use conversational language and explain medical or insurance terminology.
Keep most responses under 160 words.
`;

const MODE_PROMPTS = {
  symptoms: `
${COMMON_SAFETY_PROMPT}

The user selected Symptom Guidance mode.

Your purpose is to help the user decide what type and level of care may be
appropriate. You are not diagnosing the user.

Ask only the follow-up questions needed to understand:
- The main symptom.
- When it started.
- Its severity.
- Relevant age group.
- Important emergency warning signs.

Guide the user toward one of these options when appropriate:
- Call emergency services.
- Visit emergency care.
- Visit urgent care.
- Contact primary care.
- Contact an appropriate specialist.
- Monitor the symptom and arrange routine follow-up.

You may discuss general possibilities, but never tell the user that they
definitely have a particular medical condition.

End with a practical next step and important warning signs to watch for.
`,

  medicare: `
${COMMON_SAFETY_PROMPT}

The user selected Medicare & Insurance mode.

Help the user understand:
- Medicare Part A.
- Medicare Part B.
- Medicare Advantage, also called Part C.
- Medicare Part D.
- Medigap.
- Medicaid.
- Provider networks.
- Referrals.
- Prior authorization.
- Premiums, deductibles, copays, and coinsurance.
- Affordable-care and no-insurance options.

Ask which insurance or Medicare coverage the user has when that information
would materially affect the answer. Ask for the user's state when rules or
resources may vary by location.

Clearly distinguish Medicare from Medicaid.

Never guarantee that a service, treatment, medication, or provider is covered.
For important coverage decisions, tell the user to verify the information with
Medicare.gov, 1-800-MEDICARE, their insurance plan, or the healthcare provider.

End with a practical next step.
`,
};

// ─── Watsonx helper ───────────────────────────────────────────────────────────

async function sendMessageToWatsonx({ mode, messages }) {
  const systemPrompt = MODE_PROMPTS[mode];
  if (!systemPrompt) throw new Error("The selected Nova mode is not supported.");

  const accessToken     = await getIBMAccessToken();
  const watsonxBaseURL  = process.env.WATSONX_URL.replace(/\/$/, "");
  const watsonxEndpoint = `${watsonxBaseURL}/ml/v1/text/chat?version=2024-05-31`;

  const res = await fetch(watsonxEndpoint, {
    method:  "POST",
    headers: {
      Authorization:   `Bearer ${accessToken}`,
      "Content-Type":  "application/json",
      Accept:          "application/json",
    },
    body: JSON.stringify({
      model_id:    process.env.WATSONX_MODEL_ID,
      space_id:    process.env.WATSONX_SPACE_ID,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.2,
      max_tokens:  450,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.errors?.[0]?.message ||
      data?.error ||
      data?.message ||
      "The watsonx.ai request failed.";
    throw new Error(msg);
  }

  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error("watsonx.ai returned an empty response.");
  return reply;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Auth routes (rate-limited).
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth",          authRouter);

// Health-check (unauthenticated, intentionally minimal).
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "nova-health" });
});

// Chat route — requires valid access token.
app.post("/api/chat", requireAuth, chatLimiter, async (req, res) => {
  const { mode, messages } = req.body || {};

  // Validate mode.
  if (!["symptoms", "medicare"].includes(mode)) {
    return res.status(400).json({ error: "Choose either symptoms or medicare mode." });
  }

  // Validate messages array.
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return res.status(400).json({ error: "Messages must contain between 1 and 30 items." });
  }

  const ALLOWED_ROLES = new Set(["user", "assistant"]);
  const cleaned = messages
    .filter((m) => m && ALLOWED_ROLES.has(m.role))
    .map((m) => ({
      role:    m.role,
      content: String(m.content || "").trim().slice(0, 4000),
    }))
    .filter((m) => m.content);

  if (cleaned.length === 0) {
    return res.status(400).json({ error: "Please enter a message." });
  }

  try {
    const reply = await sendMessageToWatsonx({ mode, messages: cleaned });
    return res.json({ message: reply });
  } catch (err) {
    console.error("[chat] Watsonx error:", err.message);
    return res.status(500).json({ error: "Nova could not respond. Please try again." });
  }
});

// Analyze-photo route — requires valid access token.
app.post("/api/analyze-photo", requireAuth, chatLimiter, async (req, res) => {
  const { mediaType, base64Data } = req.body || {};

  if (!mediaType || typeof mediaType !== "string" || !/^image\/(jpeg|png|webp|gif)$/.test(mediaType)) {
    return res.status(400).json({ error: "A valid image mediaType is required." });
  }

  if (!base64Data || typeof base64Data !== "string" || base64Data.length > 5_000_000) {
    return res.status(400).json({ error: "base64Data is required and must be under 5 MB." });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mediaType, data: base64Data } },
              {
                text:
                  "You are helping a patient describe a medical photo to their doctor. " +
                  "Look at this image and write 3-5 short bullet points describing only what " +
                  "you can objectively see: body part/location, color, texture, size, swelling, " +
                  "or any visible changes. Do not diagnose, do not suggest conditions. " +
                  "Start directly with the bullet points, no intro sentence.",
              },
            ],
          }],
          generationConfig: { maxOutputTokens: 300 },
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      throw new Error(data?.error?.message || "Gemini request failed.");
    }

    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!summary) throw new Error("Gemini returned an empty response.");

    return res.json({ summary });
  } catch (err) {
    console.error("[analyze-photo] Error:", err.message);
    return res.status(500).json({ error: "Could not analyze the photo. Please try again." });
  }
});

// Voice-summary route — uses Groq; key stays server-side only.
// Requires valid access token.
app.post("/api/voice-summary", requireAuth, chatLimiter, async (req, res) => {
  const { text } = req.body || {};

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "text is required." });
  }

  if (text.length > 8000) {
    return res.status(400).json({ error: "text is too long." });
  }

  try {
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model:      "llama3-8b-8192",
      max_tokens: 320,
      messages: [
        {
          role:    "system",
          content:
            "You are a medical documentation assistant. The user will give you a voice description of an emergency or medical event. " +
            "Extract and reformat it as a concise, clear emergency summary a paramedic or ER provider can read in seconds. " +
            "Use this structure: PATIENT / WHAT HAPPENED / SYMPTOMS / TIME / LOCATION (if mentioned). " +
            "Keep it under 120 words. Do not diagnose. Use plain language. If information is missing, omit that field.",
        },
        { role: "user", content: text.trim() },
      ],
    });

    const summary = completion?.choices?.[0]?.message?.content;
    if (!summary) throw new Error("Groq returned an empty response.");

    return res.json({ summary });
  } catch (err) {
    console.error("[voice-summary] Error:", err.message);
    return res.status(500).json({ error: "Could not generate the summary. Please try again." });
  }
});

// ─── Centralized error handler ────────────────────────────────────────────────
// Catches errors passed via next(err) or unhandled throws in async routes.
// NEVER exposes stack traces, paths, or internal details to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error("[server] Unhandled error:", err.message);
  if (!res.headersSent) {
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// ─── Startup ──────────────────────────────────────────────────────────────────

async function start() {
  validateEnvironment();
  await runMigrations();

  app.listen(PORT, () => {
    console.log(`Nova backend running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("[startup] Fatal:", err.message);
  process.exit(1);
});
