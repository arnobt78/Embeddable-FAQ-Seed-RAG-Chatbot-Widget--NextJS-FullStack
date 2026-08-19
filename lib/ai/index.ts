/**
 * Multi-provider chat orchestrator — Layer 3 of the fallback chain.
 * Walks CHAT_PROVIDERS in priority order; within each provider tries models in sequence.
 * On 429 rate limit, skips remaining models for that provider (fast-skip).
 */

import {
  CHAT_PROVIDERS,
  resolveProviderApiKey,
  type ChatProviderConfig,
} from './providers';
import { buildAIMessages, type RawMessage } from './normalize-messages';
import { isRateLimited, isRetriableError } from './retriable';
import { streamGemini } from './gemini-stream';
import { streamOpenAICompatible, streamHuggingFaceFetch } from './openai-stream';

const SYSTEM_PROMPT = `You are a helpful assistant for Arnob Mahmud's portfolio website. Be friendly, professional, and concise. Use the FAQ context to give accurate answers. If you don't know something, say so.`;

/** Try all models for a single provider; returns result or null if all models failed */
async function tryProvider(
  provider: ChatProviderConfig,
  apiKey: string,
  messages: ReturnType<typeof buildAIMessages>,
  stream: boolean
) {
  let rateLimited = false;

  for (const modelId of provider.models) {
    if (rateLimited) break;

    try {
      if (provider.id === 'gemini') {
        return await streamGemini(apiKey, modelId, messages, stream);
      }

      if (provider.id === 'huggingface') {
        // Prefer AI SDK path; fall back to direct fetch for router compatibility
        try {
          return await streamOpenAICompatible({
            providerId: provider.id,
            apiKey,
            modelId,
            baseUrl: provider.baseUrl,
            messages,
            stream,
          });
        } catch {
          const fetchResult = await streamHuggingFaceFetch(apiKey, modelId, messages, stream);
          if (fetchResult) return fetchResult;
          continue;
        }
      }

      return await streamOpenAICompatible({
        providerId: provider.id,
        apiKey,
        modelId,
        baseUrl: provider.baseUrl,
        messages,
        stream,
      });
    } catch (error) {
      if (isRateLimited(error)) {
        rateLimited = true;
        break;
      }
      if (!isRetriableError(error)) {
        throw error;
      }
    }
  }

  return null;
}

/**
 * Get an AI response using the full free-tier fallback chain.
 * Returns { textStream } for streaming (SSE) or { text } for non-streaming.
 */
export async function getAIResponse(
  messages: RawMessage[],
  context?: string,
  stream = true
) {
  const aiMessages = buildAIMessages(messages, SYSTEM_PROMPT, context);

  for (const provider of CHAT_PROVIDERS) {
    const apiKey = resolveProviderApiKey(provider);
    if (!apiKey) continue;

    try {
      const result = await tryProvider(provider, apiKey, aiMessages, stream);
      if (result) return result;
    } catch (error) {
      console.error(`[ai] ${provider.id} failed:`, error instanceof Error ? error.message : error);
    }
  }

  throw new Error('All AI models failed');
}
