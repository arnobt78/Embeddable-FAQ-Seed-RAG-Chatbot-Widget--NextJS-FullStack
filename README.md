# Embeddable RAG FAQ-Based AI Chatbot Widget - Next.js, Redis, Vectorize FAQ Seed, Multiple AI Models, Full-Stack Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Redis](https://img.shields.io/badge/Upstash-Redis-red)](https://upstash.com/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green)](https://nodejs.org/)
[![launch with diploi badge](https://diploi.com/launch.svg)](https://diploi.com/launch/arnobt78/portfolio-chatbot-widget)

A production-ready, self-hosted **RAG (Retrieval Augmented Generation)** chatbot widget built with Next.js, Upstash Redis vector storage, and a multi-provider AI fallback chain. Embed it in a portfolio site, SaaS dashboard, or any web app — with a React widget or a vanilla JS script.

- **Live Demo:** [https://portfolio-chatbot-widget.vercel.app/](https://portfolio-chatbot-widget.vercel.app/)
- **Production Live:** [https://www.arnobmahmud.com/](https://www.arnobmahmud.com/)
- **Security:** Private reports → [SECURITY.md](./SECURITY.md) · [contact@arnobmahmud.com](mailto:contact@arnobmahmud.com)
- **Author:** [Arnob Mahmud](https://www.arnobmahmud.com/) · **LinkedIn:** [linkedin.com/in/arnob-mahmud-05839655](https://www.linkedin.com/in/arnob-mahmud-05839655/) · **GitHub:** [github.com/arnobt78](https://github.com/arnobt78)

![Screenshot 2026-01-25 at 15 13 47](https://github.com/user-attachments/assets/d7416481-2f01-4f89-aad0-8eb7297b72fa)
![Screenshot 2026-01-25 at 15 13 59](https://github.com/user-attachments/assets/468cfffa-40e6-4561-8dbc-a263a5e224ac)
![Screenshot 2026-01-25 at 15 14 09](https://github.com/user-attachments/assets/cd835693-5a84-4368-a4cd-e90ff7c57e66)
![Screenshot 2026-01-25 at 15 14 27](https://github.com/user-attachments/assets/a22f9ce9-8355-4e6e-8ff5-0f8c6854a9e5)
![Screenshot 2026-01-25 at 15 14 49](https://github.com/user-attachments/assets/5c5400c4-0d44-4590-8a71-181d3d57ab6b)
![Screenshot 2026-01-25 at 15 14 58](https://github.com/user-attachments/assets/af6b6a71-3124-4a13-81ee-3d99a642993a)
![Screenshot 2026-01-25 at 15 15 16](https://github.com/user-attachments/assets/2059cd6d-ce3b-4e5d-a7fc-6d4a61fd0452)

---

## Table of Contents

- [What You Will Learn](#what-you-will-learn)
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [How It Works (Architecture)](#how-it-works-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Seeding the FAQ Knowledge Base](#seeding-the-faq-knowledge-base)
- [Usage & Embedding](#usage--embedding)
- [API Reference](#api-reference)
- [Frontend Architecture](#frontend-architecture)
- [Backend & AI Pipeline](#backend--ai-pipeline)
- [Reusing Components in Other Projects](#reusing-components-in-other-projects)
- [Deployment](#deployment)
- [Observability (Sentry)](#observability-sentry)
- [Documentation Index](#documentation-index)
- [Known Limitations](#known-limitations)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [License](#license)
- [Happy Coding](#happy-coding)

---

## What You Will Learn

By studying and running this project, you will learn:

- How to build a **RAG chatbot** with vector search over a FAQ knowledge base
- How to stream AI responses with **Server-Sent Events (SSE)** on Next.js Edge routes
- How to store **sessions and embeddings** in serverless Redis (Upstash)
- How to design a **multi-provider AI fallback chain** (Gemini → OpenRouter → Groq → Hugging Face → OpenAI)
- How to embed a chat widget via **React** or **vanilla JavaScript**
- How to manage client state with **TanStack Query** (cache, optimistic updates)
- How to wire **Sentry** with same-origin tunneling to bypass ad blockers

---

## Overview

This repository is a **full-stack Next.js application** that serves two roles:

1. **Hosted chatbot backend** — API routes for chat, history, feedback, and FAQ seeding
2. **Embeddable UI** — floating chat widget (React in `layout.tsx`, or `public/widget.js` for external sites)

Users ask questions in natural language. The system:

1. Embeds the question as a vector
2. Finds the top matching FAQs in Redis (cosine similarity)
3. Injects that context into the LLM prompt
4. Streams the answer back token-by-token
5. Persists the conversation in Redis (30-day session cookie)

The default FAQ dataset contains **20 Q&A pairs** about Arnob Mahmud (portfolio use case). Replace `lib/faqs.ts` with your own content for any domain.

---

## Features

### Core

| Feature                 | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| **RAG search**          | Semantic FAQ retrieval via embeddings + cosine similarity      |
| **Streaming replies**   | SSE from `/api/chat` — tokens appear as they generate          |
| **Session history**     | HttpOnly cookie `chatbot_session` + Redis persistence          |
| **AI fallbacks**        | Automatic provider/model chain if one API fails or rate-limits |
| **Embedding fallbacks** | Gemini → Hugging Face → OpenRouter → OpenAI for vectors        |
| **Dual embed modes**    | React widget (this repo) or standalone `widget.js`             |
| **Theme system**        | Dark/light mode, zero-flash inline script in `layout.tsx`      |
| **Mobile UX**           | Keyboard-aware positioning, responsive widget                  |

### Production extras

| Feature               | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| **Security headers**  | `X-Frame-Options`, `Referrer-Policy`, etc. in `next.config.ts` |
| **Sentry (optional)** | Error tracking with `/api/monitoring` tunnel (ad-blocker safe) |
| **CORS**              | Cross-origin embed support with credentials on API routes      |
| **Edge runtime**      | Fast chat/history/feedback on Vercel Edge                      |

---

## Technology Stack

### Frontend

| Library                                       | Version | Role                                            |
| --------------------------------------------- | ------- | ----------------------------------------------- |
| [Next.js](https://nextjs.org/)                | 16.1.4  | App Router, SSR layout, API routes              |
| [React](https://react.dev/)                   | 19.2.3  | UI components, hooks                            |
| [TypeScript](https://www.typescriptlang.org/) | 5.x     | Type safety                                     |
| [Tailwind CSS](https://tailwindcss.com/)      | 3.4     | Styling                                         |
| [TanStack Query](https://tanstack.com/query)  | 5.x     | Server state, chat cache key `["chat-history"]` |
| [Radix UI](https://www.radix-ui.com/)         | —       | Accessible dialogs, menus, toasts               |
| [Lucide React](https://lucide.dev/)           | —       | Icons                                           |

**TanStack Query in one sentence:** It fetches `/api/history` on load, caches messages, and applies optimistic updates when you send a message — so the UI feels instant while the stream completes.

### Backend

| Library / Service                                                            | Role                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------ |
| [Upstash Redis](https://upstash.com/)                                        | Session JSON + FAQ vector hashes           |
| [Google Gemini](https://ai.google.dev/)                                      | Primary chat + embeddings                  |
| [OpenRouter](https://openrouter.ai/)                                         | Free-tier model fallbacks (`:free` suffix) |
| [Groq](https://groq.com/)                                                    | Fast OSS model fallbacks                   |
| [Hugging Face Router](https://huggingface.co/)                               | Embedding + chat fallbacks                 |
| [OpenAI](https://openai.com/)                                                | Optional paid last resort                  |
| [Vercel AI SDK](https://sdk.vercel.ai/) (`ai` package)                       | Streaming abstraction                      |
| [@sentry/nextjs](https://docs.sentry.io/platforms/javascript/guides/nextjs/) | Optional error monitoring                  |

### Runtimes

| Route                                        | Runtime                                  |
| -------------------------------------------- | ---------------------------------------- |
| `/api/chat`, `/api/history`, `/api/feedback` | **Edge**                                 |
| `/api/seed`                                  | **Node.js** (longer embedding batch job) |

---

## How It Works (Architecture)

```text
User message
    │
    ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Chat Widget    │────▶│  POST /api/chat  │────▶│  getSession()   │
│  (React / JS)   │◀────│  SSE stream      │◀────│  saveSession()  │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              searchFAQ()   getAIResponse()  Redis
              (RAG)         (fallback chain) (Upstash)
                    │            │
                    ▼            ▼
              generateEmbedding  Gemini / OpenRouter /
              + cosine search    Groq / HF / OpenAI
```

**RAG step (`lib/rag.ts`):**

```typescript
// 1. Embed the user question
const queryEmbedding = await generateEmbedding(query);
// 2. Compare against all FAQ vectors in Redis
const results = await searchVectors(queryEmbedding, topK);
// 3. Format top matches as LLM context
return results
  .map((r) => `Q: ${r.metadata.question}\nA: ${r.metadata.answer}`)
  .join("\n\n");
```

**Session cookie:** New visitors get `chatbot_session=sess_...` (HttpOnly, SameSite=Lax, 30 days). The same ID loads history on return visits.

---

## Project Structure

```text
portfolio-chatbot-widget/
├── app/
│   ├── api/
│   │   ├── chat/route.ts       # POST — SSE streaming chat
│   │   ├── history/route.ts    # GET — load session messages
│   │   ├── feedback/route.ts   # POST — feedback form (logs; email TBD)
│   │   └── seed/route.ts       # POST — embed FAQs into Redis
│   ├── global-error.tsx        # Sentry global error boundary
│   ├── layout.tsx              # SSR shell + theme script + ChatbotWidget
│   ├── page.tsx                # Demo landing page
│   ├── providers.tsx           # TanStack Query + widget settings
│   └── robots.ts               # SEO / AI crawler rules
├── components/
│   ├── chatbot/
│   │   ├── chatbot-widget.tsx  # Main floating widget UI
│   │   ├── widget-menu.tsx     # Settings menu (theme, font, position)
│   │   └── message-skeleton.tsx
│   └── ui/                     # shadcn-style primitives (button, dialog, …)
├── contexts/
│   └── widget-settings-context.tsx  # Theme, font size, position (localStorage)
├── hooks/
│   ├── use-chat.ts             # TanStack Query + SSE sendMessage
│   └── use-widget-settings.ts
├── lib/
│   ├── ai/                     # Provider registry + streaming orchestrator
│   │   ├── providers.ts        # Model chains per provider
│   │   ├── index.ts            # getAIResponse() fallback loop
│   │   ├── gemini-stream.ts
│   │   ├── openai-stream.ts
│   │   ├── normalize-messages.ts
│   │   └── retriable.ts        # 429 / 5xx classification
│   ├── embeddings.ts           # Multi-provider embedding generation
│   ├── faqs.ts                 # FAQ knowledge base (edit this!)
│   ├── rag.ts                  # searchFAQ()
│   ├── redis.ts                # Sessions, vectors, cosine search
│   ├── sentry-env.ts           # DSN + tunnel path helpers
│   ├── sentry-filters.ts       # Ignore extension/browser noise
│   └── constants.ts
├── public/
│   ├── widget.js               # Vanilla embed script for external sites
│   └── styles.css              # Widget styles (shared)
├── docs/                       # Deployment, guardrails, integration guides
├── instrumentation.ts            # Sentry server/edge bootstrap
├── instrumentation-client.ts   # Sentry client + tunnel
├── sentry.server.config.ts
├── sentry.edge.config.ts
├── next.config.ts                # Security headers + Sentry wrapper
├── .env.example                  # All env vars (copy to .env.local)
└── SECURITY.md                   # Private vulnerability reporting
```

---

## Prerequisites

- **Node.js 24.x** (see `.nvmrc` and `package.json` engines)
- **npm** (or pnpm/yarn)
- **Upstash Redis** account (free tier works)
- **Google Gemini API key** (primary AI)
- **Hugging Face token** (embedding fallback — recommended)
- Optional: OpenRouter, Groq, OpenAI keys for deeper fallback coverage
- Optional: Sentry project for error monitoring

---

## Installation & Setup

### 1. Clone and install

```bash
git clone https://github.com/arnobt78/portfolio-chatbot-widget.git
cd portfolio-chatbot-widget
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` — see [Environment Variables](#environment-variables) below.

### 3. Seed FAQs (required before first chat)

```bash
npm run dev
# In another terminal (set SEED_SECRET in .env.local first):
curl -X POST http://localhost:3000/api/seed \
  -H "Authorization: Bearer $SEED_SECRET"
```

Expected response: `{"success":true,"count":20}`

### 4. Open the demo

Visit [http://localhost:3000](http://localhost:3000) and use the widget in the bottom-right corner.

---

## Environment Variables

Copy from [`.env.example`](.env.example). **Never commit `.env.local`.**

### Required (minimum to run chat)

| Variable                | Description              | Where to get                                                             |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------ |
| `UPSTASH_REDIS_URL`     | Upstash REST URL         | [console.upstash.com](https://console.upstash.com) → Database → REST API |
| `UPSTASH_REDIS_TOKEN`   | Upstash REST token       | Same as above                                                            |
| `GOOGLE_GEMINI_API_KEY` | Primary LLM + embeddings | [aistudio.google.com/apikey](https://aistudio.google.com/apikey)         |
| `HUGGING_FACE_API_KEY`  | Embedding fallback       | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |

### Optional — AI fallbacks

| Variable             | Description                                     |
| -------------------- | ----------------------------------------------- |
| `OPENROUTER_API_KEY` | Free-tier models via OpenRouter (`:free` chain) |
| `GROQ_API_KEY`       | Groq OSS models                                 |
| `OPENAI_API_KEY`     | Paid last-resort chat + embeddings              |

Alternate names supported: `OpenRouter_API_KEY`, `Groq_Llama_API_KEY`, `Hugging_Face_Inference_API_KEY`.

### App / widget configuration

| Variable                  | Default                 | Description                                      |
| ------------------------- | ----------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_CHATBOT_URL` | `http://localhost:3000` | Public deploy URL (embed + API base)             |
| `NEXT_PUBLIC_SITE_URL`    | —                       | OpenRouter HTTP-Referer fallback                 |
| `CHATBOT_TITLE`           | `Chat Assistant`        | Widget header title                              |
| `CHATBOT_GREETING`        | `👋 How can I help…`    | First message bubble                             |
| `CHATBOT_PLACEHOLDER`     | `Message...`            | Input placeholder                                |
| `SESSION_TTL`             | `2592000` (30 days)     | Redis session TTL in seconds                     |
| `SEED_SECRET`               | —                       | **Required** — protects `POST /api/seed`         |
| `FEEDBACK_EMAIL`          | —                       | Intended recipient (email sending not wired yet) |

### Optional — Sentry

| Variable                 | Description                                |
| ------------------------ | ------------------------------------------ |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser DSN (required for client errors)   |
| `SENTRY_DSN`             | Server alias (falls back to public DSN)    |
| `SENTRY_ORG`             | Org slug — build-time source maps          |
| `SENTRY_PROJECT`         | **Project slug** (not org name)            |
| `SENTRY_AUTH_TOKEN`      | CI/Vercel auth token for source map upload |

When DSN is empty, Sentry is **disabled** — no runtime overhead.

### Example `.env.local` (minimal)

```env
UPSTASH_REDIS_URL=https://xxxx.upstash.io
UPSTASH_REDIS_TOKEN=AXxxxx
GOOGLE_GEMINI_API_KEY=AIza...
HUGGING_FACE_API_KEY=hf_...
NEXT_PUBLIC_CHATBOT_URL=http://localhost:3000
```

---

## Running the Project

| Command         | Purpose                                       |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Development server at `http://localhost:3000` |
| `npm run build` | Production build (TypeScript + Next.js)       |
| `npm start`     | Run production server locally                 |
| `npm run lint`  | ESLint                                        |

**Node version:** Use Node 24 (`nvm use` reads `.nvmrc`).

---

## Seeding the FAQ Knowledge Base

The seed endpoint reads `lib/faqs.ts`, generates embeddings in batches, and stores vectors in Redis.

```bash
curl -X POST https://your-domain.com/api/seed \
  -H "Authorization: Bearer $SEED_SECRET"
```

`SEED_SECRET` must be set in `.env.local` / Vercel — requests without a valid secret return `401`; if unset server-side, returns `503`.

**When to re-seed:** After editing `lib/faqs.ts` or changing embedding models.

**Customize FAQs:** Edit the `faqs` array in `lib/faqs.ts` — each entry is `[question, answer]`.

### Production re-seed (Vercel Bot Protection)

With **Bot Protection = Challenge** enabled (recommended), raw `curl` from a cold terminal may return **429**. Reseed is **not blocked** — use one of these:

**Option A — Browser DevTools (easiest, no firewall changes)**

1. Open [https://portfolio-chatbot-widget.vercel.app](https://portfolio-chatbot-widget.vercel.app) in Safari/Chrome.
2. DevTools → Console:

```javascript
fetch('/api/seed', {
  method: 'POST',
  headers: { Authorization: 'Bearer YOUR_SEED_SECRET' }
}).then(r => r.json()).then(console.log)
// Expected: { success: true, count: 20 }
```

**Option B — Terminal curl (same machine)**

1. Visit the site in a browser first (passes the Vercel challenge cookie).
2. Then run:

```bash
curl -X POST https://portfolio-chatbot-widget.vercel.app/api/seed \
  -H "Authorization: Bearer $SEED_SECRET"
```

**Option C — Automated cron/CI only (optional)**

Add a Vercel Firewall exception for `POST /api/seed` if you need hands-off reseed without a browser visit. Not required for normal use.

---

## Usage & Embedding

### Option A — React widget (this repo)

Already mounted in `app/layout.tsx` via `<ChatbotWidget />`. Config comes from env vars injected into `window`:

```javascript
window.CHATBOT_BASE_URL = "https://your-app.vercel.app";
window.CHATBOT_TITLE = "Chat Assistant";
window.CHATBOT_GREETING = "👋 How can I help you today?";
window.CHATBOT_PLACEHOLDER = "Message...";
```

### Option B — Vanilla JS on any website

On your external site (e.g. WordPress, static HTML):

```html
<script>
  window.CHATBOT_BASE_URL = "https://portfolio-chatbot-widget.vercel.app";
  window.CHATBOT_TITLE = "Portfolio Assistant";
</script>
<script
  src="https://portfolio-chatbot-widget.vercel.app/widget.js"
  async
></script>
```

The script creates a floating button, loads `/styles.css` from your deployment, and calls the same `/api/chat` and `/api/history` endpoints with cookies.

### Option C — Copy components into another Next.js app

1. Copy `components/chatbot/`, `hooks/use-chat.ts`, `contexts/widget-settings-context.tsx`
2. Copy `public/styles.css`
3. Point `CHATBOT_BASE_URL` at your deployed API origin
4. Ensure CORS + credentials work for your domain

---

## API Reference

### `POST /api/chat`

Stream a chat response.

**Request:**

```json
{ "message": "Tell me about Arnob Mahmud" }
```

**Headers:** `Cookie: chatbot_session=...` (optional — created if missing)

**Response:** `text/event-stream`

```text
data: {"response":"Hello"}
data: {"response":" there"}
data: [DONE]
```

**Runtime:** Edge

---

### `GET /api/history`

Return messages for the current session cookie.

**Response:**

```json
{
  "messages": [
    { "role": "user", "content": "Hi", "timestamp": 1700000000000 },
    { "role": "assistant", "content": "Hello!", "timestamp": 1700000001000 }
  ]
}
```

**Runtime:** Edge

---

### `DELETE /api/history`

Clear the current session on the server and expire the session cookie. Used by **Clear Chat** / **New Chat** in the widget.

**Response:** `{ "success": true }`

**Runtime:** Edge

---

### `POST /api/seed`

Embed all FAQs from `lib/faqs.ts` into Redis. **Requires auth:**

```bash
Authorization: Bearer <SEED_SECRET>
# or
x-seed-secret: <SEED_SECRET>
```

**Response:** `{ "success": true, "count": 20 }`

**Runtime:** Node.js

---

### `POST /api/feedback`

Submit widget feedback or issue report.

**Request:**

```json
{
  "type": "feedback",
  "rating": 5,
  "comment": "Great widget!",
  "email": "user@example.com"
}
```

**Note:** Logs to server console; email integration is TODO.

**Runtime:** Edge

---

All chat/history/feedback routes support **CORS** with `Access-Control-Allow-Credentials: true` for cross-origin embeds.

---

## Frontend Architecture

### `useChat` hook (`hooks/use-chat.ts`)

- **Query key:** `["chat-history"]` — loads history on mount
- **Optimistic update:** User message appears immediately on send
- **Streaming:** Parses SSE chunks and updates assistant message in cache
- **Rollback:** On error, restores previous cache snapshot

```typescript
const { messages, sendMessage, isLoading, clearChat } = useChat();
```

### Widget settings (`contexts/widget-settings-context.tsx`)

Persists to `localStorage`:

- Theme (light / dark)
- Font size
- Widget position (left / right)

### Zero-flash theme

An inline `<script>` in `layout.tsx` runs **before paint**, reads `localStorage`, and sets CSS variables — preventing a white flash on dark mode.

---

## Backend & AI Pipeline

### Provider registry (`lib/ai/providers.ts`)

Chat providers are tried **in order**. Within each provider, models are tried until one succeeds. On HTTP 429, remaining models for that provider are skipped (fast-skip).

| Order | Provider     | Example models                              |
| ----- | ------------ | ------------------------------------------- |
| 1     | Gemini       | `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| 2     | OpenRouter   | `openai/gpt-oss-20b:free`, …                |
| 3     | Groq         | `openai/gpt-oss-120b`, …                    |
| 4     | Hugging Face | `openai/gpt-oss-20b`, …                     |
| 5     | OpenAI       | `gpt-4o-mini` (paid)                        |

See [docs/LLM_MODEL_SELECTION.md](docs/LLM_MODEL_SELECTION.md) for verification notes and update policy.

### Embeddings (`lib/embeddings.ts`)

Used by RAG search and `/api/seed`. Fallback chain: Gemini → Hugging Face Router → OpenRouter free embedding → OpenAI.

### Redis data model (`lib/redis.ts`)

| Key pattern            | Content                                        |
| ---------------------- | ---------------------------------------------- |
| `chat:session:{id}`    | JSON session with messages (TTL)               |
| `chat:vectors:faq-{n}` | Hash: `vector`, `metadata` (question + answer) |

Vector search uses in-process cosine similarity over all FAQ keys (fine for ~20–100 FAQs; for larger scale, use RediSearch or a dedicated vector DB).

---

## Reusing Components in Other Projects

| Piece                     | Reuse strategy                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **`ChatbotWidget`**       | Drop into any Next.js `layout.tsx` with `Providers`                                                                                       |
| **`useChat`**             | Change `CHATBOT_BASE_URL` or pass custom API base                                                                                         |
| **`lib/faqs.ts`**         | Replace Q&A content — your domain knowledge                                                                                               |
| **`lib/ai/providers.ts`** | Adjust model IDs when providers deprecate models                                                                                          |
| **`public/widget.js`**    | Zero-build embed for non-React sites                                                                                                      |
| **Integration guide**     | [docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md](docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md) — portable Redis/Sentry/PostHog patterns |

**Minimal external embed checklist:**

1. Deploy this app (or fork) with env vars set
2. `POST /api/seed` once (with `Authorization: Bearer $SEED_SECRET`)
3. Add `widget.js` + `CHATBOT_BASE_URL` to your site
4. Ensure your domain is allowed by CORS (currently reflects request `Origin`)

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add all env vars from `.env.example`
4. Deploy — Node 24 picked up via `engines` field
5. Post-deploy: re-seed using [Production re-seed](#production-re-seed-vercel-bot-protection) (browser DevTools or curl after visiting site)
6. Set `NEXT_PUBLIC_CHATBOT_URL` to your Vercel URL

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full steps including Vercel Firewall (Bot Challenge + AI Bots Deny).

### Self-hosted

```bash
npm run build
npm start
```

Requires Node 24 and the same env vars.

---

## Observability (Sentry)

Optional error tracking with **ad-blocker-safe tunnel**:

- Client events POST to same-origin `/api/monitoring`
- Server forwards to Sentry ingest
- Noise filters drop browser extension errors

Setup details: [docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md](docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md#2-sentry-error-tracking)

---

## Documentation Index

| Document                                                                                         | Purpose                         |
| ------------------------------------------------------------------------------------------------ | ------------------------------- |
| [docs/PROJECT_WALKTHROUGH.md](docs/PROJECT_WALKTHROUGH.md)                                       | Agent/dev quick reference       |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)                                                         | Vercel/VPS deploy steps         |
| [docs/LLM_MODEL_SELECTION.md](docs/LLM_MODEL_SELECTION.md)                                       | Free-tier model research        |
| [docs/VERCEL_PRODUCTION_GUARDRAILS.md](docs/VERCEL_PRODUCTION_GUARDRAILS.md)                     | Headers, robots, firewall       |
| [docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md](docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md) | Portable integration patterns   |
| [docs/AGILE_V_PROTOCOL.md](docs/AGILE_V_PROTOCOL.md)                                             | Project planning protocol       |
| [SECURITY.md](SECURITY.md)                                                                       | Private vulnerability reporting |

---

## Known Limitations

| Item              | Status                                                     |
| ----------------- | ---------------------------------------------------------- |
| API rate limiting | Not implemented at HTTP layer (AI layer has 429 fast-skip) |
| Feedback email    | Logs only — no Resend/SendGrid yet                         |
| PostHog analytics | Documented as optional template, not wired in code         |
| Large FAQ corpora | In-memory cosine scan — migrate to vector DB at scale      |

---

## Keywords

`RAG` · `Retrieval Augmented Generation` · `Next.js App Router` · `Edge Runtime` · `Server-Sent Events` · `SSE streaming` · `Upstash Redis` · `vector search` · `cosine similarity` · `embeddings` · `Google Gemini` · `OpenRouter` · `Groq` · `Hugging Face` · `chatbot widget` · `embeddable widget` · `portfolio chatbot` · `TanStack Query` · `React 19` · `TypeScript` · `Tailwind CSS` · `self-hosted AI` · `FAQ bot` · `Sentry tunnel` · `open source`

---

## Conclusion

This project demonstrates a **complete, deployable RAG chatbot** you can host yourself, customize with your own FAQs, and embed anywhere. The architecture prioritizes **reliability** (multi-provider fallbacks), **performance** (Edge streaming), and **developer experience** (typed hooks, clear API routes, portable docs).

Fork it, swap `lib/faqs.ts`, adjust branding env vars, and you have a production-grade assistant for your portfolio or product docs.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

---

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Security:** Please report vulnerabilities privately via [SECURITY.md](SECURITY.md) → [contact@arnobmahmud.com](mailto:contact@arnobmahmud.com).
