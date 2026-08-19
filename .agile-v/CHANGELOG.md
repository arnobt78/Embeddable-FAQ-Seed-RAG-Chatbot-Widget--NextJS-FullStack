# Agile V Changelog — Cycle C1

---

## 2026-08-20 — Deps, build hygiene, prod smoke

### Changed
- Next 16.3.1, React 19.2.8, ai SDK patches; 0 npm audit vulns
- Quiet builds: Sentry silent/telemetry off, NEXT_TELEMETRY_DISABLED, `.npmrc`, allowScripts, browserslist postinstall
- Docs: README prod reseed, VERCEL §8, Sentry Step 6b

### Removed
- Unused deps: `@upstash/qstash`, `@ai-sdk/google`

### Verified
- Lint PASS, build PASS, prod seed/chat/clear smoke PASS

---

## 2026-08-20 — Wave 1 + docs

### Added
- Seed auth (`SEED_SECRET`), `DELETE /api/history`, shared libs (query-keys, session-cookie, cors, schemas)
- Sentry tunnel + noise filters, integration guide refresh
- `docs/PROJECT_WALKTHROUGH.md`, `SECURITY.md`, full `README.md`

### Completed requirements
- REQ-0003, REQ-0004, REQ-0014; partial REQ-0002, REQ-0006, REQ-0008, REQ-0009, REQ-0013

### Verified
- Lint PASS, build PASS

---

## 2026-08-19 — Bootstrap session

### Added

- `.agile-v/` workspace (STATE, REQUIREMENTS, TASKS, RISKS, GATES, VALIDATION_SUMMARY, DECISION_LOG, CHECKLIST, PLAYBOOK)
- REQ-0001 through REQ-0013
- RISK-0001 through RISK-0009
- Prioritized Wave 0–4 task plan

### Updated

- `CLAUDE.md` — populated from verified repo analysis

### Verified

- Lint PASS, build PASS (after npm install)
- No test suite exists
- No prior `.agile-v/` state to resume

### Not changed

- Implementation source code (per protocol)
