# CLAUDE.md — Agent Memory (compact)

## Project
**Name:** `portfolio-chatbot-widget` · RAG FAQ chatbot (Next.js 16, React 19, Upstash Redis, multi-AI fallbacks)  
**Live:** portfolio-chatbot-widget.vercel.app · arnobmahmud.com  
**Cycle:** C1 · Resume: `.agile-v/STATE.md`

## Stack
Next.js App Router · Edge (`/api/chat|history|feedback`) + Node (`/api/seed`) · TanStack Query · Sentry tunnel `/api/monitoring` · Node 24

## Flow
Widget/`useChat` → `POST /api/chat` (SSE) → `lib/rag.ts` → `lib/ai/` → Redis session (`chatbot_session` cookie)

## Security (Wave 1 done)
- **`SEED_SECRET` required** — `POST /api/seed` Bearer or `x-seed-secret` (`lib/auth/seed-auth.ts`)
- **Clear chat** — `DELETE /api/history` + optimistic TanStack mutation (`chatHistoryQueryKey`)
- Session: HttpOnly cookie · **No JWT** · **No HTTP rate limit yet** (Wave 2 REQ-0005)

## Key libs
| Path | Role |
|------|------|
| `lib/query-keys.ts` | `chatHistoryQueryKey` |
| `lib/session-cookie.ts` | Cookie parse/build/clear |
| `lib/schemas.ts` | Zod chat + feedback |
| `lib/ai/providers.ts` | AI fallback chain |
| `lib/redis.ts` | Sessions, vectors, `deleteSession` |

## Embeds
React: `layout.tsx` + `ChatbotWidget` · External: `public/widget.js` + `CHATBOT_BASE_URL`

## Validation
`npm run lint` · `npm run build` · Record in `.agile-v/VALIDATION_SUMMARY.md`

## Docs
`README.md` · `docs/PROJECT_WALKTHROUGH.md` · `docs/DEPLOYMENT.md` · `docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md`

## Next (Wave 2)
Rate limit `/api/chat` · CORS allowlist · full Zod on all routes · `npm test`

## Rules
Server-first layout · No duplicate query keys · Source code = truth · Wait approval for new waves
