# Agile V State

**Last updated:** 2026-08-20  
**Session:** Wave 1 + deps/build hygiene + prod smoke + docs

---

## Cycle & Gate

| Field | Value |
|-------|-------|
| Cycle | C1 |
| Stage | 3 — Synthesis (partial) |
| Gate | Human Gate 1 pending for Wave 2 |
| Phase dir | none |

---

## Project Snapshot

**Name:** portfolio-chatbot-widget  
**Status:** Wave 1 **COMPLETE** · prod verified (seed/chat/clear) · deps upgraded Next 16.3.1 · 0 audit vulns  
**Live:** [portfolio-chatbot-widget.vercel.app](https://portfolio-chatbot-widget.vercel.app/)

---

## Active Requirements

| ID | Title | Status |
|----|-------|--------|
| REQ-0003 | Secure `/api/seed` | **COMPLETE** |
| REQ-0004 | Clear chat server sync | **COMPLETE** |
| REQ-0014 | Free-tier AI alignment | **COMPLETE** |
| REQ-0013 | Sentry observability | **PARTIAL** (PostHog deferred) |
| REQ-0009 | Production guardrails | **PARTIAL** (CORS + rate limit Wave 2) |
| REQ-0005 | HTTP rate limiting | DEFERRED Wave 2 |

---

## Completed This Session

- Wave 1: seed auth, DELETE history, Zod chat/feedback, shared libs, widget.js clear
- Sentry tunnel + filters + quiet build flags
- Deps: Next 16.3.1, React 19.2.8, ai SDK patches, 0 vulnerabilities
- Build noise: `.npmrc`, `allowScripts`, browserslist postinstall, telemetry off
- Removed unused deps: `@upstash/qstash`, `@ai-sdk/google`
- Prod smoke: seed 200 (browser), chat SSE, clear + refresh empty
- Docs: README reseed, VERCEL guardrails §8, Sentry guide Step 6b

---

## Next Exact Action

Wave 2: rate limit `/api/chat`, production CORS allowlist, optional `npm test`.

---

## Manual Post-Deploy

1. `SEED_SECRET` on Vercel
2. Reseed via README § Production re-seed (DevTools or curl after browser visit)
3. Smoke: chat, clear + refresh
