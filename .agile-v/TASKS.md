# Tasks — Cycle C1 (Prioritized Plan)

**Status:** Wave 1 COMPLETE · Wave 2 pending  
**Last updated:** 2026-08-20

---

## Evidence Summary (Analysis Phase)

```
Scope: analyzed (full repo) | Traceability: REQ-0001..0013 | Findings: 0 PASS impl / 13 FLAG planned
Decision Points: embed strategy, seed auth model, C1 scope | Log: 2026-08-19 | bootstrap-agent | ANALYSIS_COMPLETE | C1 bootstrap | REQ-0001
```

---

## Wave 0 — Completed (this session)

| Task ID | Requirement | Description | Status |
|---------|-------------|-------------|--------|
| TASK-0001 | REQ-0001 | Repository analysis & reconciliation | DONE |
| TASK-0002 | REQ-0001 | Create `.agile-v/` planning files | DONE |
| TASK-0003 | REQ-0001 | Baseline lint + build validation | DONE |
| TASK-0004 | REQ-0002 | Populate `CLAUDE.md` (partial — `.env.example` pending) | DONE |

---

## Wave 1 — Completed

**Goal:** Safe onboarding + close highest-severity security/correctness gaps.

| Task ID | Requirement | Description | Status |
|---------|-------------|-------------|--------|
| TASK-0010 | REQ-0002 | `.env.example` | **DONE** |
| TASK-0011 | REQ-0003 | `SEED_SECRET` seed auth | **DONE** |
| TASK-0012 | REQ-0004 | DELETE history + clearChat | **DONE** |
| TASK-0013 | REQ-0008 | Demo page seed note, README | **DONE** |

**Wave 1 exit criteria:** met.

---

## Wave 2 — Hardening

**Goal:** Production safety and input integrity.

| Task ID | Requirement | Description | Affected files | Est. |
|---------|-------------|-------------|----------------|------|
| TASK-0020 | REQ-0006 | Zod schemas for chat + feedback APIs | **PARTIAL DONE** (chat/feedback wired) |
| TASK-0021 | REQ-0005 | Rate limiting (Upstash Ratelimit suggested) | API routes, `lib/rate-limit.ts` | M |
| TASK-0022 | REQ-0009 | Security headers + production CORS allowlist | `next.config.ts`, CORS helper | M |
| TASK-0023 | REQ-0008 | Reconcile integration docs (mark unimplemented) | `docs/*.md` | S |

**Wave 2 exit criteria:** validation on inputs, rate limits active, headers deployed in config.

---

## Wave 3 — Quality & maintainability

**Goal:** Regression prevention and codebase hygiene.

| Task ID | Requirement | Description | Affected files | Est. |
|---------|-------------|-------------|----------------|------|
| TASK-0030 | REQ-0007 | Vitest setup + RAG/redis unit tests | `package.json`, tests | L |
| TASK-0031 | REQ-0007 | API smoke tests (chat/history) | tests | M |
| TASK-0032 | REQ-0011 | Remove unused deps (`qstash`, unused AI SDK pkgs) | `package.json` | S |
| TASK-0033 | REQ-0008 | Deduplicate `CHATBOT_BASE_URL` resolution | `lib/constants.ts`, hooks, widget-menu | S |

**Wave 3 exit criteria:** `npm test` passes, dependency list justified.

---

## Wave 4 — Deferred (C1 optional / C2)

| Task ID | Requirement | Description | Notes |
|---------|-------------|-------------|-------|
| TASK-0040 | REQ-0010 | Upstash Vector migration | Performance at scale |
| TASK-0041 | REQ-0012 | Feedback email (Resend) | Needs provider choice |
| TASK-0042 | REQ-0013 | Sentry + PostHog | Needs account/env |
| TASK-0043 | — | React vs `widget.js` consolidation | Human decision required |

---

## Recommended approval scope

**Option A (Recommended):** Waves 1–2 — security, correctness, docs, validation  
**Option B (Minimal):** Wave 1 only — seed protection + clear chat + `.env.example`  
**Option C (Full C1):** Waves 1–3 — includes test baseline  

---

## Human Gate 1 checklist

- [ ] Approve requirement set (REQ-0001..0013)
- [ ] Choose wave scope (A / B / C)
- [ ] Decide seed auth model (secret header vs other)
- [ ] Decide embed strategy (dual vs single widget)
- [ ] Record approval in `.agile-v/GATES.md`

---

## Size key

S = small (< 1 session) · M = medium · L = large (multi-session)
