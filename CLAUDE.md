# CLAUDE.md — Agent Memory (compact)

## Project
**Name:** `portfolio-chatbot-widget` · RAG FAQ chatbot (Next.js **16.3.1**, React 19.2.8, Upstash Redis)  
**Live:** portfolio-chatbot-widget.vercel.app · arnobmahmud.com  
**Cycle:** C1 · Resume: `.agile-v/STATE.md`

## Stack
Next.js App Router · Edge (`/api/chat|history|feedback`) + Node (`/api/seed`) · TanStack Query · Sentry tunnel `/api/monitoring` · Node 24

## Flow
Widget/`useChat` → `POST /api/chat` (SSE) → `lib/rag.ts` → `lib/ai/` → Redis session (`chatbot_session` cookie)

## Security (Wave 1 done)
- **`SEED_SECRET`** — `POST /api/seed` Bearer/`x-seed-secret` (`lib/auth/seed-auth.ts`)
- **Clear chat** — `DELETE /api/history` + optimistic TanStack (`chatHistoryQueryKey`)
- HttpOnly session cookie · **No JWT** · **No SHA encrypt** · **No HTTP rate limit** (Wave 2)

## Build hygiene
`NEXT_TELEMETRY_DISABLED=1` · Sentry `silent: true` + `telemetry: false` · `.npmrc` fund=false · `allowScripts` whitelist · `postinstall: update-browserslist-db`

## Key libs
| Path | Role |
|------|------|
| `lib/query-keys.ts` | `chatHistoryQueryKey` (single cache domain) |
| `lib/session-cookie.ts` | Cookie parse/build/clear |
| `lib/schemas.ts` | Zod chat + feedback |
| `lib/ai/providers.ts` | AI fallback chain |
| `lib/redis.ts` | Sessions, vectors, `deleteSession` |

## Prod reseed
Bot Protection may 429 cold curl — use browser DevTools fetch or visit site then curl. See README § Production re-seed.

## Validation
`npm run lint` · `npm run build` · `npm audit` → 0 vulns (2026-08-20)

## Next (Wave 2)
Rate limit `/api/chat` · CORS allowlist · Zod all routes · `npm test`

## Rules
Server-first · No duplicate query keys · Source = truth · Wait approval for new waves
