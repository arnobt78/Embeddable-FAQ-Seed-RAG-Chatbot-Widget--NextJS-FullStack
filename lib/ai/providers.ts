/**
 * Chat provider registry — Layer 1 of the multi-provider fallback chain.
 * Model IDs verified against docs/LLM_MODEL_SELECTION.md (2026-08-19).
 * Update model arrays here when providers deprecate models; orchestration logic stays unchanged.
 */

export type ChatProviderId =
  | 'gemini'
  | 'openrouter'
  | 'groq'
  | 'huggingface'
  | 'openai';

export interface ChatProviderConfig {
  id: ChatProviderId;
  /** Env var names checked in order; first non-empty value wins */
  envKeys: string[];
  /** Models tried in order within this provider before moving to the next provider */
  models: string[];
  /** OpenAI-compatible base URL; omitted for Gemini (native SDK) and Groq (AI SDK) */
  baseUrl?: string;
  /** When true, only used if key is set — not a free-tier provider */
  paid?: boolean;
}

/** Ordered fallback priority: fastest/most reliable free tiers first */
export const CHAT_PROVIDERS: ChatProviderConfig[] = [
  {
    id: 'gemini',
    envKeys: ['GOOGLE_GEMINI_API_KEY'],
    // gemini-2.5-pro is paid-only on free AI Studio tier (Apr 2026)
    models: ['gemini-2.5-flash', 'gemini-2.5-flash-lite'],
  },
  {
    id: 'openrouter',
    envKeys: ['OPENROUTER_API_KEY', 'OpenRouter_API_KEY'],
    baseUrl: 'https://openrouter.ai/api/v1',
    // :free suffix required — see https://openrouter.ai/models?max_price=0
    models: [
      'openai/gpt-oss-20b:free',
      'deepseek/deepseek-chat-v3-0324:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'qwen/qwen3-coder-480b:free',
    ],
  },
  {
    id: 'groq',
    envKeys: ['GROQ_API_KEY', 'Groq_Llama_API_KEY'],
    // llama-3.3-70b-versatile shutdown 2026-08-16 — replaced per console.groq.com/docs/deprecations
    models: ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b'],
  },
  {
    id: 'huggingface',
    envKeys: ['HUGGING_FACE_API_KEY', 'Hugging_Face_Inference_API_KEY'],
    baseUrl: 'https://router.huggingface.co/v1',
    models: ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'Qwen/Qwen3-0.6B'],
  },
  {
    id: 'openai',
    envKeys: ['OPENAI_API_KEY'],
    models: ['gpt-4o-mini'],
    paid: true,
  },
];

/** Resolve the first configured API key for a provider from process.env */
export function resolveProviderApiKey(provider: ChatProviderConfig): string | undefined {
  for (const key of provider.envKeys) {
    const value = process.env[key];
    if (value?.trim()) return value.trim();
  }
  return undefined;
}

/** OpenRouter/HF referer header for provider attribution */
export function getOpenRouterHeaders(): Record<string, string> {
  return {
    'HTTP-Referer':
      process.env.NEXT_PUBLIC_CHATBOT_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://www.arnobmahmud.com',
    'X-Title': 'Portfolio Chatbot',
  };
}
