import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;
const TOKEN_URL = "https://iam.cloud.ibm.com/identity/token";

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json({ limit: "10mb" }));

// Cache the IBM access token so a new one is not requested for every message.
let cachedToken = null;
let tokenExpiresAt = 0;

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

function validateEnvironment() {
  const requiredVariables = [
    "WATSONX_API_KEY",
    "WATSONX_SPACE_ID",
    "WATSONX_URL",
    "WATSONX_MODEL_ID",
  ];

  const missingVariables = requiredVariables.filter(
    (variableName) => !process.env[variableName]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing environment variables: ${missingVariables.join(", ")}`
    );
  }
}

async function getIBMAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const tokenRequestBody = new URLSearchParams({
    grant_type: "urn:ibm:params:oauth:grant-type:apikey",
    apikey: process.env.WATSONX_API_KEY,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: tokenRequestBody,
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(
      data?.errorMessage ||
        data?.error_description ||
        "IBM Cloud authentication failed."
    );
  }

  cachedToken = data.access_token;

  const expiresInSeconds = data.expires_in || 3600;

  tokenExpiresAt =
    Date.now() + Math.max(60, expiresInSeconds - 120) * 1000;

  return cachedToken;
}

async function sendMessageToWatsonx({ mode, messages }) {
  validateEnvironment();

  const systemPrompt = MODE_PROMPTS[mode];

  if (!systemPrompt) {
    throw new Error("The selected Nova mode is not supported.");
  }

  const accessToken = await getIBMAccessToken();

  const watsonxBaseURL = process.env.WATSONX_URL.replace(/\/$/, "");

  const watsonxEndpoint =
    `${watsonxBaseURL}/ml/v1/text/chat?version=2024-05-31`;

  const response = await fetch(watsonxEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model_id: process.env.WATSONX_MODEL_ID,
      space_id: process.env.WATSONX_SPACE_ID,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.2,
      max_tokens: 450,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data?.errors?.[0]?.message ||
      data?.error ||
      data?.message ||
      "The watsonx.ai request failed.";

    throw new Error(errorMessage);
  }

  const assistantMessage = data?.choices?.[0]?.message?.content;

  if (!assistantMessage) {
    throw new Error("watsonx.ai returned an empty response.");
  }

  return assistantMessage;
}

// Analyze-photo route (uses Google Gemini vision)
app.post("/api/analyze-photo", async (request, response) => {
  try {
    const { mediaType, base64Data } = request.body || {};
    if (!mediaType || !base64Data) {
      return response.status(400).json({ error: "mediaType and base64Data are required." });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mediaType, data: base64Data } },
              { text: "You are helping a patient describe a medical photo to their doctor. Look at this image and write 3-5 short bullet points describing only what you can objectively see: body part/location, color, texture, size, swelling, or any visible changes. Do not diagnose, do not suggest conditions. Start directly with the bullet points, no intro sentence." },
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

    response.json({ summary });
  } catch (error) {
    console.error("Analyze-photo error:", error.message);
    response.status(500).json({ error: error.message || "Could not analyze the photo." });
  }
});

// Health-check route
app.get("/api/health", (request, response) => {
  response.json({
    status: "ok",
    service: "nova-health-watsonx",
  });
});

// Chat route
app.post("/api/chat", async (request, response) => {
  try {
    const { mode, messages } = request.body || {};

    if (!["symptoms", "medicare"].includes(mode)) {
      return response.status(400).json({
        error: "Choose either symptoms or medicare mode.",
      });
    }

    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 30
    ) {
      return response.status(400).json({
        error: "Messages must contain between 1 and 30 items.",
      });
    }

    const cleanedMessages = messages
      .map((message) => ({
        role: message?.role === "assistant" ? "assistant" : "user",
        content: String(message?.content || "")
          .trim()
          .slice(0, 4000),
      }))
      .filter((message) => message.content);

    if (cleanedMessages.length === 0) {
      return response.status(400).json({
        error: "Please enter a message.",
      });
    }

    const assistantMessage = await sendMessageToWatsonx({
      mode,
      messages: cleanedMessages,
    });

    response.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error("Nova chat error:", error.message);

    response.status(500).json({
      error: error.message || "Nova could not respond.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Nova backend running at http://localhost:${PORT}`);
});