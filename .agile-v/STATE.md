# Agile V State

**Last updated:** 2026-08-20  
**Session:** Wave 1 complete + agent docs refresh

---

## Cycle & Gate

| Field | Value |
|-------|-------|
| Cycle | C1 |
| Stage | 3 — Synthesis (partial) |
| Gate | Human Gate 1 still pending for remaining Wave 2 hardening |
| Phase dir | none yet |

---

## Project Snapshot

**Name:** FAQ / Portfolio Chatbot Widget (`portfolio-chatbot-widget`)  
**Purpose:** Self-hosted embeddable RAG chatbot (Next.js 16, Redis vectors, multi-provider AI fallbacks)  
**Status:** Wave 1 complete — seed protected, clear chat server-synced, Zod on chat/feedback  
**Live:** [portfolio-chatbot-widget.vercel.app](https://portfolio-chatbot-widget.vercel.app/) · [arnobmahmud.com](https://www.arnobmahmud.com/)

---

## Active Requirements

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| REQ-0001 | Agile V workspace & traceability | P0 | IN_PROGRESS |
| REQ-0003 | Secure `/api/seed` | P0 | **COMPLETE** |
| REQ-0004 | Clear chat server sync | P1 | **COMPLETE** |
| REQ-0014 | Free-tier AI model alignment | P0 | COMPLETE |
| REQ-0009 | Production security guardrails | P1 | **PARTIAL** (CORS + dashboard firewall manual) |
| REQ-0002 | Developer onboarding | P0 | **PARTIAL** |
| REQ-0008 | Documentation reconciliation | P1 | **PARTIAL** |
| REQ-0013 | Observability (Sentry / PostHog) | P3 | **PARTIAL** |
| REQ-0005–0012 | (unchanged) | — | see REQUIREMENTS.md |

---

## Completed This Session

- `lib/auth/seed-auth.ts` — timing-safe `SEED_SECRET` verify (503 if unset)
- `DELETE /api/history` — Redis session delete + cookie expire
- `hooks/use-chat.ts` — optimistic clear mutation + server DELETE
- `public/widget.js` — clear calls DELETE /api/history
- Shared: `lib/query-keys.ts`, `lib/session-cookie.ts`, `lib/api/cors.ts`, `lib/schemas.ts`
- Zod validation on `/api/chat` and `/api/feedback`
- Docs: `.env.example`, `DEPLOYMENT.md`, `README.md`, demo page seed note

---

## Next Exact Action

Wave 2: rate limit, CORS allowlist. Docs: `docs/PROJECT_WALKTHROUGH.md` for agents.

---

## Manual Post-Deploy

1. Set `SEED_SECRET` on Vercel before seeding production
2. Seed: `curl -X POST .../api/seed -H "Authorization: Bearer $SEED_SECRET"`
3. Test clear chat → refresh → empty history
