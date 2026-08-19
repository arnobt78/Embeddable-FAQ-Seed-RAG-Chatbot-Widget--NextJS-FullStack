# Project Walkthrough — Agent / Developer Quick Reference

**Last updated:** 2026-08-20 · **Repo:** `portfolio-chatbot-widget`

---

## What this is

Self-hosted **RAG FAQ chatbot**: embeddable widget, Redis vector search, SSE streaming, multi-provider AI fallbacks.

---

## Run locally

```bash
npm install
cp .env.example .env.local   # UPSTASH, GEMINI, HF, SEED_SECRET
npm run dev
curl -X POST http://localhost:3000/api/seed -H "Authorization: Bearer $SEED_SECRET"
```

---

## API routes

| Route | Method | Auth | Runtime |
|-------|--------|------|---------|
| `/api/chat` | POST | Session cookie | Edge |
| `/api/history` | GET, DELETE | Session cookie | Edge |
| `/api/seed` | POST | `SEED_SECRET` header | Node |
| `/api/feedback` | POST | None | Edge |

---

## Data flow (chat)

1. Client → `POST /api/chat` (Zod `{ message }`)
2. RAG embed + cosine search → Redis FAQ vectors
3. LLM SSE stream → client
4. Persist `chat:session:{id}` in Redis

---

## Frontend state (TanStack Query)

- Single key: `chatHistoryQueryKey` = `["chat-history"]` in `lib/query-keys.ts`
- **Send:** optimistic user msg → stream → `setQueryData`
- **Clear:** optimistic empty → `DELETE /api/history` → rollback on error
- **Settings:** `widget-settings-context` + localStorage (not server CRUD)
- No global densify mesh — only one server data domain (chat history); appropriate for widget scope

---

## Shared modules (Wave 1)

```
lib/auth/seed-auth.ts      # timing-safe SEED_SECRET
lib/session-cookie.ts      # chatbot_session helpers
lib/api/cors.ts            # embed CORS (reflect Origin — allowlist Wave 2)
lib/schemas.ts             # Zod chat + feedback
lib/redis.ts               # get/save/deleteSession, vectors
hooks/use-chat.ts          # chat hook + mutations
public/widget.js           # vanilla embed + DELETE clear
```

---

## Security posture

| Done | Deferred (Wave 2+) |
|------|---------------------|
| Seed secret auth | HTTP rate limiting |
| HttpOnly session cookie | Production CORS allowlist |
| Sentry + tunnel + quiet build | JWT / user auth |
| Security headers + robots | SHA session encryption |
| Zod chat/feedback | Zod seed/history |

---

## Build / deploy hygiene

- `NEXT_TELEMETRY_DISABLED=1` in build script
- Sentry: `silent: true`, `telemetry: false`, `deleteSourcemapsAfterUpload`
- `.npmrc` fund=false · `allowScripts` whitelist · browserslist postinstall
- See `docs/VERCEL_PRODUCTION_GUARDRAILS.md` §8, Sentry guide Step 6b

---

## Production re-seed

Bot Protection may 429 cold curl. Use browser DevTools `fetch('/api/seed', …)` or visit site then curl. README § Production re-seed.

---

## Deploy checklist

1. Vercel env: `.env.example` + **`SEED_SECRET`**
2. Deploy → reseed (README methods)
3. `NEXT_PUBLIC_CHATBOT_URL`
4. Firewall: Bot Challenge, AI Bots Deny
5. Smoke: chat, clear + refresh, Sentry

---

## Agent resume

`.agile-v/STATE.md` → `CLAUDE.md` → this file → source code.
