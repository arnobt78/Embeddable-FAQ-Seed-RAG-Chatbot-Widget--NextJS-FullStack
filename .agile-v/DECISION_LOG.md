# Decision Log (append-only)

---

## DEC-0001 — Bootstrap Cycle C1

| Field | Value |
|-------|-------|
| Date | 2026-08-19 |
| Agent | bootstrap / analysis session |
| Requirement | REQ-0001 |
| Decision | Initialize Agile V workspace; no `.agile-v/` existed |
| Rationale | AGILE_V_PROTOCOL requires bootstrap when workspace missing |
| Status | ACCEPTED |

---

## DEC-0002 — Source of truth for reconciliation

| Field | Value |
|-------|-------|
| Date | 2026-08-19 |
| Agent | bootstrap / analysis session |
| Requirement | REQ-0001 |
| Decision | Treat running code as source of truth over README/integration guides |
| Rationale | AGENTS.md + protocol; several docs describe unimplemented features |
| Status | ACCEPTED |

---

## DEC-0003 — Recommended implementation scope (pending approval)

| Field | Value |
|-------|-------|
| Date | 2026-08-19 |
| Agent | bootstrap / analysis session |
| Requirement | REQ-0001..0009 |
| Decision | Propose Wave 1–2 as default approved scope (Option A in TASKS.md) |
| Rationale | Addresses HIGH risks (seed, clear chat, abuse) before tests/observability |
| Status | **PENDING HUMAN GATE 1** |

---

## DEC-0004 — Seed protection approach (proposed, not implemented)

| Field | Value |
|-------|-------|
| Date | 2026-08-19 |
| Agent | bootstrap / analysis session |
| Requirement | REQ-0003 |
| Decision | Propose `SEED_SECRET` env + `Authorization: Bearer` or `x-seed-secret` header |
| Rationale | Minimal change, compatible with curl deploy docs; no full auth system |
| Status | **ACCEPTED** (implemented Wave 1) |

---

## DEC-0008 — Strict SEED_SECRET required in all environments

| Field | Value |
|-------|-------|
| Date | 2026-08-20 |
| Agent | implementation session |
| Requirement | REQ-0003 |
| Decision | `SEED_SECRET` mandatory — seed returns 503 if unset; 401 if header missing/wrong; timing-safe compare |
| Rationale | Fail closed; no accidental public seed in production or dev without explicit secret |
| Status | ACCEPTED |

---

## DEC-0005 — Free-tier model registry refactor

| Field | Value |
|-------|-------|
| Date | 2026-08-19 |
| Agent | implementation session |
| Requirement | REQ-0014 |
| Decision | Split `lib/ai.ts` into registry (`providers.ts`) + orchestrator (`index.ts`); Gemini native SDK kept for primary; OpenRouter uses `:free` suffix chain |
| Rationale | LLM_MODEL_SELECTION.md Layer 1–3 pattern; Groq Llama shutdown 2026-08-16; OpenRouter gpt-4o-mini is paid |
| Status | ACCEPTED |

---

## DEC-0006 — Vercel guardrails without CSP or Attack Mode

| Field | Value |
|-------|-------|
| Date | 2026-08-19 |
| Agent | implementation session |
| Requirement | REQ-0009 |
| Decision | Apply headers, robots, immutable static cache, Node 24; skip strict CSP (inline theme scripts); recommend Challenge not Attack Mode for firewall |
| Rationale | CSP would break layout inline scripts; Attack Mode adds friction to all users; embed widget uses browser fetch not iframe |
| Status | ACCEPTED |

---

## DEC-0007 — Sentry tunnel via same-origin rewrite

| Field | Value |
|-------|-------|
| Date | 2026-08-19 |
| Agent | implementation session |
| Requirement | REQ-0013 |
| Decision | Wire `@sentry/nextjs` with `tunnelRoute: "/api/monitoring"` in `withSentryConfig`; client `tunnel` option matches; no replay integration; tracesSampleRate 0.1 prod / 1.0 dev; init via instrumentation hooks (no layout client conversion) |
| Rationale | Ad blockers block `*.ingest.sentry.io`; same-origin POST via Next.js rewrite bypasses blockers without manual API route; lean config preserves widget performance on free tier |
| Status | ACCEPTED |
