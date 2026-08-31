# Nova Health

> AI-powered healthcare navigation for the uninsured and underinsured in the US.

---

## Problem statement

26.7 million Americans are uninsured, and millions more are underinsured. When people get sick, they face a maze of confusing options: Which symptoms need a doctor? Where can I find free or low-cost care? What does my insurance actually cover? How do I describe what I'm seeing to a provider?

The result is delayed care, unnecessary ER visits, crushing medical debt, and worse health outcomes — all driven by a lack of accessible, plain-language guidance at the moment it matters most.

---

## Solution description

Nova Health is a web app that acts as a personal healthcare navigator. It helps people understand their symptoms, find care options, manage costs, and communicate effectively with providers — without needing to already understand the system.

| Tab | What it does |
|---|---|
| **Home** | Chat with Nova (IBM Granite via watsonx.ai) — describe symptoms and get plain-language guidance on what level of care to seek |
| **Insurance lens** | Browse providers filtered by specialty, language, accessibility, and insurance level |
| **No insurance** | Find free/low-cost clinics (HRSA), Medicaid eligibility, 211 social services, and financial aid by ZIP code and state |
| **Urgent** | Upload a photo of a wound or symptom for an objective visual description, and use voice-to-text to build an emergency summary to share with paramedics |
| **Manage costs** | Understand care cost estimates, see what a plan covers, and manage a payment plan |
| **Learn** | First aid guides, prevention tips, nutrition, mental health, and when to see a doctor |

Additional features:
- Light, dark, and colorblind-friendly themes
- Voice dictation for the chat (Web Speech API)
- One-click copy for AI-generated summaries
- Home tab nav cards linking all sections

---

## AI approach and architecture

Nova uses two AI models working together:

### IBM watsonx.ai — Granite (chat)
The Home tab chat is powered by IBM Granite via watsonx.ai. The frontend sends user messages to a Node.js/Express backend, which authenticates with IBM Cloud IAM, then calls the watsonx.ai chat completions API. Two system prompt modes are supported: `symptoms` (healthcare navigation) and `medicare` (insurance guidance). Responses are kept under 160 words and never diagnose.

### Google Gemini Vision (photo analysis)
The Urgent tab photo analysis uses Google Gemini's vision model. When a user uploads a photo, the frontend sends the base64-encoded image to the backend, which forwards it to the Gemini API with a prompt that extracts only objective, observable characteristics — no diagnosis. The result is a bullet-point summary the user can send to a provider.

```
Browser
  │
  ├── Chat message  ──▶  Express backend  ──▶  IBM Cloud IAM (token)
  │                                       ──▶  watsonx.ai (Granite chat)
  │
  └── Photo upload  ──▶  Express backend  ──▶  Google Gemini Vision
```

The backend acts as a secure proxy — API keys never touch the browser.

---

## Selected challenge theme

**Wildcard**

Nova Health addresses one of the most universal challenges in the US: navigating a fragmented, expensive, and confusing healthcare system. It targets the 26.7 million uninsured Americans and the far larger group who have insurance but don't understand how to use it effectively. By combining AI-powered symptom guidance, real clinic finders, cost transparency, and emergency tools in one accessible app, Nova Health reduces the information gap that leads to delayed care and medical debt.

---

## How IBM Bob was used

IBM Bob was used throughout the entire development process as an AI pair programmer:

- **Code generation** — Bob wrote and scaffolded the React components, Express backend, watsonx.ai API integration, and Gemini vision endpoint from scratch
- **Debugging** — Bob diagnosed and fixed issues including port mismatches, CORS errors, missing environment variables, merge conflicts, and module not found errors
- **Git workflow** — Bob handled branching, merging, conflict resolution, and pushing to GitHub
- **Architecture decisions** — Bob recommended routing all AI calls through the backend proxy to keep API keys secure, and suggested Gemini as a free vision alternative when watsonx vision models were unavailable
- **UI improvements** — Bob built the themed component system, dark/colorblind modes, nav cards, tab indicators, and the ManageCareCosts component restyled to match the app's design language
- **Content** — Bob wrote the Learn tab guides (first aid, prevention, dental hygiene, nutrition, mental health)
- **Documentation** — Bob wrote this README

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Lucide icons |
| Backend | Node.js, Express, Helmet |
| AI (chat) | IBM watsonx.ai — Granite (`ibm/granite-4-h-small`) |
| AI (photo analysis) | Google Gemini Vision (`gemini-3.5-flash`) |
| Clinic finder | HRSA Find a Health Center, 211.org, healthcare.gov |

---

## Project structure

```
IBM-Wildcard/
├── src/
│   ├── NovaHealth.jsx        # All frontend tabs and UI
│   └── ManageCareCosts.jsx   # Manage costs tab component
├── backend/
│   ├── server.js             # Express API — watsonx.ai chat + Gemini photo analysis
│   ├── package.json
│   └── .env                  # API keys (not committed)
├── public/
├── index.html
├── vite.config.js
└── package.json
```

---

## Running locally

You need **two terminals**.

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:5001`.

### 2. Frontend

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`.

---

## Environment variables

Create `backend/.env` with the following:

```
WATSONX_API_KEY=your_ibm_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_SPACE_ID=your_space_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-4-h-small
GEMINI_API_KEY=your_gemini_api_key
PORT=5001
```

**Never commit `.env` to git** — it is already listed in `backend/.gitignore`.

| Key | Where to get it |
|---|---|
| `WATSONX_API_KEY` | [IBM Cloud](https://cloud.ibm.com) → Manage → Access (IAM) → API Keys |
| `WATSONX_PROJECT_ID` / `WATSONX_SPACE_ID` | [watsonx.ai](https://dataplatform.cloud.ibm.com) → Deployment space → Manage tab |
| `WATSONX_MODEL_ID` | The model deployed in your watsonx.ai space |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) → Get API key |

---

## Deploying

Nova Health is deployed as a Vercel Services project. The Vite frontend and Express backend are deployed together under one domain.

| Service | Root | Route |
| --- | --- | --- |
| Frontend | `.` | `/` |
| Backend | `backend` | `/api/*` |

Deployment configuration is defined in the root-level `vercel.json` file. Environment variables are configured securely through the Vercel project settings.

Every push to the `main` branch automatically triggers a new production deployment.
---

## Disclaimer

Nova provides general health information and navigation only. It does not diagnose medical conditions, prescribe medication, or guarantee insurance coverage. In an emergency, call 911.
