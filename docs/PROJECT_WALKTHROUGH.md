# Project Walkthrough — Agent / Developer Quick Reference

**Last updated:** 2026-08-20 · **Repo:** `portfolio-chatbot-widget`

---

## What this is

Self-hosted **RAG FAQ chatbot**: embeddable widget, Redis vector search, SSE streaming, multi-provider AI fallbacks.

---

## Run locally

```bash
npm install
cp .env.example .env.local   # set UPSTASH, GEMINI, HF, SEED_SECRET
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

1. Client sends message → `POST /api/chat`
2. RAG: embed query → cosine search FAQ vectors in Redis
3. LLM stream with FAQ context → SSE to client
4. Save messages to `chat:session:{id}` in Redis

---

## Frontend state

- **TanStack Query:** `chatHistoryQueryKey` = `["chat-history"]` in `lib/query-keys.ts`
- **Send:** optimistic user msg → stream → cache update
- **Clear:** optimistic empty → `DELETE /api/history` → rollback on error
- **Settings:** `widget-settings-context` + localStorage (theme, font, position)

---

## Shared modules (Wave 1)

```
lib/auth/seed-auth.ts      # timing-safe SEED_SECRET
lib/session-cookie.ts      # chatbot_session helpers
lib/api/cors.ts            # embed CORS headers
lib/schemas.ts             # Zod chat + feedback
lib/redis.ts               # get/save/deleteSession, vectors
hooks/use-chat.ts          # chat hook + mutations
```

---

## Security posture

| Done | Deferred (Wave 2+) |
|------|---------------------|
| Seed secret auth | HTTP rate limiting |
| HttpOnly session cookie | Production CORS allowlist |
| Sentry + tunnel | JWT / user auth |
| Security headers | SHA session encryption |
| Zod on chat/feedback | Zod on all routes |

---

## Deploy checklist

1. Vercel env: all `.env.example` vars + **`SEED_SECRET`**
2. Deploy → seed with Bearer secret
3. Set `NEXT_PUBLIC_CHATBOT_URL`
4. Vercel Firewall: Bot Challenge, AI Bots Deny (see `docs/DEPLOYMENT.md`)
5. Smoke: chat, clear chat + refresh, Sentry event

---

## Agent resume

Read order: `.agile-v/STATE.md` → `CLAUDE.md` → this file → source for truth.
