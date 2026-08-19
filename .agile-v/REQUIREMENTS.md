# Requirements — Cycle C1

Stable IDs. Do not remove; mark SUPERSEDED with reason if changed.

---

## REQ-0001 — Agile V workspace & traceability

**Priority:** P0  
**Status:** IN_PROGRESS  
**Source:** AGILE_V_PROTOCOL.md bootstrap

### Description

Establish `.agile-v/` project memory, requirement IDs, gate tracking, and session handoff so any agent can resume without chat history.

### Acceptance criteria

- [x] `.agile-v/STATE.md` with cycle, gate, resume point
- [x] REQUIREMENTS.md, TASKS.md, RISKS.md, GATES.md, VALIDATION_SUMMARY.md
- [ ] Human Gate 1 approval recorded in GATES.md

### Affected files

`.agile-v/*`, `CLAUDE.md`

---

## REQ-0002 — Developer onboarding

**Priority:** P0  
**Status:** **PARTIAL** (`.env.example` done; CLAUDE.md population pending)  
**Source:** Analysis — no `.env.example`, empty CLAUDE.md

### Description

Provide safe onboarding artifacts: `.env.example` with placeholders, populated `CLAUDE.md`, README env section cross-linked.

### Acceptance criteria

- [x] `.env.example` lists all env vars used in code (no secrets)
- [ ] `CLAUDE.md` reflects verified stack and architecture
- [ ] README env section matches `.env.example`

### Affected files

`.env.example`, `CLAUDE.md`, `README.md`

---

## REQ-0003 — Secure `/api/seed` endpoint

**Priority:** P0  
**Status:** **COMPLETE**  
**Source:** Analysis — unprotected expensive operation

### Description

Protect FAQ vector seeding from public abuse. Require authenticated or secret-gated access.

### Acceptance criteria

- [x] Unauthenticated POST returns 401/403
- [x] Authorized seed (secret or admin) succeeds
- [x] DEPLOYMENT.md documents seed invocation with auth
- [x] Returns 503 when `SEED_SECRET` env is not configured

### Affected files

`app/api/seed/route.ts`, `docs/DEPLOYMENT.md`, `.env.example`

### Risks

RISK-0001

---

## REQ-0004 — Clear chat syncs server session

**Priority:** P1  
**Status:** **COMPLETE**  
**Source:** Analysis — `clearChat` only clears TanStack cache

### Description

When user clears or starts new chat, server Redis session must reset so refresh does not restore old messages.

### Acceptance criteria

- [x] Clear/new chat calls API to delete or reset session
- [x] Client cache invalidated/updated after server confirms
- [x] Refresh shows empty history after clear

### Affected files

`hooks/use-chat.ts`, `components/chatbot/widget-menu.tsx`, `lib/redis.ts`, new or existing API route

---

## REQ-0005 — API rate limiting

**Priority:** P1  
**Status:** PLANNED  
**Source:** Analysis — README claim vs code; cost/abuse risk

### Description

Rate-limit chat, feedback, and seed endpoints to prevent abuse and runaway AI costs.

### Acceptance criteria

- [ ] Chat endpoint limited per IP/session
- [ ] Appropriate 429 response with Retry-After
- [ ] README updated to describe actual limiting (not embedding batch only)

### Affected files

`app/api/chat/route.ts`, `app/api/feedback/route.ts`, optionally Upstash Ratelimit, `README.md`

### Risks

RISK-0002

---

## REQ-0006 — Request validation (Zod)

**Priority:** P1  
**Status:** **PARTIAL** (chat + feedback; seed uses header auth)  
**Source:** Analysis — zod installed, unused; manual checks only

### Description

Validate API request bodies with shared Zod schemas.

### Acceptance criteria

- [x] Chat, feedback use Zod schemas (`lib/schemas.ts`)
- [x] 400 responses for invalid input with safe error messages
- [ ] Schemas reusable from client (optional future)

### Affected files

`app/api/chat/route.ts`, `app/api/feedback/route.ts`, new `lib/schemas.ts`

---

## REQ-0007 — Test coverage baseline

**Priority:** P1  
**Status:** PLANNED  
**Source:** Analysis — zero tests

### Description

Add minimal automated tests and npm scripts for regression prevention.

### Acceptance criteria

- [ ] Test runner configured (Vitest recommended for Next.js lib code)
- [ ] Unit tests for RAG/redis helpers (mocked)
- [ ] API route smoke tests or integration tests for chat/history
- [ ] `npm test` script in package.json
- [ ] Results recorded in VALIDATION_SUMMARY.md

### Affected files

`package.json`, new `__tests__/` or `*.test.ts` files, `docs/testing.md` (if created)

---

## REQ-0008 — Documentation ↔ code reconciliation

**Priority:** P1  
**Status:** **PARTIAL** (integration guide reconciled; README/demo page pending)  
**Source:** Analysis — stale README, aspirational integration guides

### Description

Align user-facing docs with verified behavior. Mark aspirational content clearly or implement it.

### Acceptance criteria

- [ ] README AI fallback chain matches `lib/ai.ts`
- [x] Integration guide matches current Sentry (instrumentation + tunnel + filters); PostHog marked optional
- [ ] Fix demo page `/api/seed` link (GET vs POST)
- [ ] Commit pending doc moves (`docs/DEPLOYMENT.md`, etc.)

### Affected files

`README.md`, `docs/*.md`, `app/page.tsx`

---

## REQ-0009 — Production security guardrails

**Priority:** P1  
**Status:** PARTIAL (code guardrails complete; CORS allowlist deferred)  
**Source:** `docs/VERCEL_PRODUCTION_GUARDRAILS.md` not applied

### Description

Apply security headers, tighten CORS policy, optional robots.txt per guardrails doc.

### Acceptance criteria

- [x] Security headers in `next.config.ts` + mirrored in `vercel.json`
- [x] `/_next/static/` immutable cache header
- [x] `app/robots.ts` (disallow `/api/`, block AI scraper UAs)
- [x] `data-scroll-behavior="smooth"` on root `<html>`
- [x] Node.js 24.x in `package.json` engines + `.nvmrc`
- [ ] CORS restricted to configured origins in production (Wave 2)
- [ ] Vercel Dashboard: Bot Protection = Challenge, AI Bots = Deny (manual post-deploy)

### Affected files

`next.config.ts`, `vercel.json`, `app/robots.ts`, `app/layout.tsx`, `package.json`, `.nvmrc`

### Risks

RISK-0003

---

## REQ-0010 — Vector search scalability

**Priority:** P2  
**Status:** DEFERRED  
**Source:** `lib/redis.ts` uses `KEYS` scan

### Description

Replace O(n) Redis KEYS scan with Upstash Vector or indexed search pattern.

### Acceptance criteria

- [ ] Vector lookup does not use full key scan at scale
- [ ] Seeding and search remain compatible with existing FAQ data

### Affected files

`lib/redis.ts`, `lib/rag.ts`, possibly Upstash Vector SDK

---

## REQ-0011 — Dependency cleanup

**Priority:** P2  
**Status:** PLANNED  
**Source:** Analysis — unused packages

### Description

Remove or use unused dependencies: `@upstash/qstash`, `@ai-sdk/google` (if Gemini stays on `@google/generative-ai`).

### Acceptance criteria

- [ ] Each dependency in package.json is imported or documented as intentional
- [ ] Build and lint pass after cleanup

### Affected files

`package.json`, possibly `lib/ai.ts`

---

## REQ-0012 — Feedback email delivery

**Priority:** P3  
**Status:** DEFERRED  
**Source:** `app/api/feedback/route.ts` TODO

### Description

Send feedback/issue reports to configured email (Resend/SendGrid).

### Acceptance criteria

- [ ] POST feedback triggers email when provider configured
- [ ] Graceful degrade when email not configured

---

## REQ-0013 — Observability (Sentry / PostHog)

**Priority:** P3  
**Status:** **PARTIAL** (Sentry wired; PostHog deferred)  
**Source:** integration guide without implementation

### Description

Wire error tracking and product analytics per integration guide, or demote guide to future roadmap.

### Acceptance criteria

- [x] Sentry env-gated init (client via `instrumentation-client.ts`, server/edge via `instrumentation.ts`)
- [x] Same-origin tunnel at `/api/monitoring` (Next.js rewrite; ad-blocker safe)
- [x] `app/global-error.tsx` captures React render errors
- [ ] PostHog implemented with env-gated init, or guide marked "planned"

### Affected files

`.env.example`, `lib/sentry-env.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, `instrumentation-client.ts`, `next.config.ts`, `app/global-error.tsx`

---

## REQ-0014 — Free-tier AI model alignment

**Priority:** P0  
**Status:** COMPLETE  
**Source:** docs/LLM_MODEL_SELECTION.md + provider deprecation (Groq Llama shutdown 2026-08-16)

### Description

Refactor chat and embedding fallback chains to use verified free-tier model IDs per LLM_MODEL_SELECTION.md.

### Acceptance criteria

- [x] Gemini: `gemini-2.5-flash` → `gemini-2.5-flash-lite` (remove paid Pro from free chain)
- [x] OpenRouter: `:free` model chain (not `gpt-4o-mini`)
- [x] Groq: OSS models replace deprecated `llama-3.3-70b-versatile`
- [x] HF: curated router model list
- [x] Provider registry pattern in `lib/ai/`
- [x] Embeddings: HF router + OpenRouter free embedding
- [x] README + LLM_MODEL_SELECTION.md updated

### Affected files

`lib/ai/*`, `lib/ai.ts`, `lib/embeddings.ts`, `README.md`, `docs/LLM_MODEL_SELECTION.md`
