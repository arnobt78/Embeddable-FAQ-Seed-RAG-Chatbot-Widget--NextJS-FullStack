# Risk Register — Cycle C1

---

## RISK-0001 — Unprotected seed endpoint

| Field | Value |
|-------|-------|
| Severity | HIGH |
| Likelihood | MEDIUM |
| Requirement | REQ-0003 |
| Status | OPEN |

**Description:** `POST /api/seed` is publicly callable; triggers expensive embedding API calls and overwrites all FAQ vectors.

**Mitigation:** Require `SEED_SECRET` (or Vercel cron + IP allowlist). Document in DEPLOYMENT.md.

---

## RISK-0002 — API abuse / AI cost spikes

| Field | Value |
|-------|-------|
| Severity | HIGH |
| Likelihood | MEDIUM |
| Requirement | REQ-0005 |
| Status | OPEN |

**Description:** No rate limiting on `/api/chat`; open CORS with credentials.

**Mitigation:** Upstash Ratelimit per IP/session; production CORS allowlist.

---

## RISK-0003 — Permissive CORS in production

| Field | Value |
|-------|-------|
| Severity | MEDIUM |
| Likelihood | HIGH |
| Requirement | REQ-0009 |
| Status | OPEN |

**Description:** API reflects request Origin or uses `*` with credentials enabled.

**Mitigation:** Allowlist `NEXT_PUBLIC_CHATBOT_URL`, site URL, and known embed origins.

---

## RISK-0004 — Clear chat data inconsistency

| Field | Value |
|-------|-------|
| Severity | MEDIUM |
| Likelihood | HIGH |
| Requirement | REQ-0004 |
| Status | OPEN |

**Description:** User clears chat in UI but Redis session persists; refresh restores history.

**Mitigation:** Server session delete/reset on clear (REQ-0004).

---

## RISK-0005 — Vector search does not scale

| Field | Value |
|-------|-------|
| Severity | MEDIUM |
| Likelihood | LOW (20 FAQs today) |
| Requirement | REQ-0010 |
| Status | ACCEPTED (deferred) |

**Description:** `redis.keys('chat:vectors:*')` is O(n); acceptable for 20 FAQs, not for large KB.

**Mitigation:** Defer to REQ-0010 / Wave 4 unless KB grows.

---

## RISK-0006 — No automated regression tests

| Field | Value |
|-------|-------|
| Severity | MEDIUM |
| Likelihood | HIGH |
| Requirement | REQ-0007 |
| Status | OPEN |

**Description:** Zero test files; refactors to `lib/ai.ts`, RAG, redis risk silent breakage.

**Mitigation:** Vitest baseline in Wave 3.

---

## RISK-0007 — Documentation drift

| Field | Value |
|-------|-------|
| Severity | LOW |
| Likelihood | HIGH |
| Requirement | REQ-0008 |
| Status | OPEN |

**Description:** README and integration guides describe features not in code (rate limit, Sentry, PostHog).

**Mitigation:** REQ-0008 reconciliation; source of truth = code.

---

## RISK-0008 — Dual widget implementation drift

| Field | Value |
|-------|-------|
| Severity | LOW |
| Likelihood | MEDIUM |
| Requirement | — |
| Status | OPEN (decision pending) |

**Description:** React widget and `public/widget.js` duplicate logic; may diverge on fixes.

**Mitigation:** Human decision: canonical path + sync policy (TASK-0043).

---

## RISK-0009 — PII in server logs

| Field | Value |
|-------|-------|
| Severity | LOW |
| Likelihood | MEDIUM |
| Requirement | REQ-0013 |
| Status | OPEN |

**Description:** Verbose logging in `lib/ai.ts` may log message content.

**Mitigation:** Redact or gate debug logs; structured logging with Sentry (deferred).
