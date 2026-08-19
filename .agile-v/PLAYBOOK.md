# Playbook — FAQ Chatbot Widget

Operational quick reference for agents. Details live in `.agile-v/STATE.md` and code.

---

## Stack

Next.js 16 App Router · React 19 · TypeScript · Tailwind · TanStack Query · Upstash Redis · Gemini/OpenRouter/Groq/HF/OpenAI fallbacks

---

## Key paths

| Area | Path |
|------|------|
| Chat API (SSE) | `app/api/chat/route.ts` |
| History | `app/api/history/route.ts` |
| Seed vectors | `app/api/seed/route.ts` |
| RAG | `lib/rag.ts`, `lib/redis.ts` |
| AI chain | `lib/ai.ts`, `lib/embeddings.ts` |
| Widget UI | `components/chatbot/chatbot-widget.tsx` |
| Chat hook | `hooks/use-chat.ts` |
| Vanilla embed | `public/widget.js` |

---

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
# npm test — not yet (REQ-0007)
```

Post-deploy seed (requires `SEED_SECRET`):

```bash
curl -X POST https://<host>/api/seed -H "Authorization: Bearer $SEED_SECRET"
```

---

## Rendering rules

- Server: `layout.tsx`, `page.tsx`
- Client: widget, providers, hooks
- Do not convert full pages to client components

---

## Mutation rules

After chat mutations: update TanStack `["chat-history"]` cache. Clear chat must also reset Redis (REQ-0004 — not yet done).

---

## Resume

Always read `.agile-v/STATE.md` first.
