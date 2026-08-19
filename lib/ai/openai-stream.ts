/**
 * OpenAI-compatible streaming for OpenRouter, Groq, Hugging Face router, and OpenAI direct.
 * Uses Vercel AI SDK streamText/generateText with provider-specific client configuration.
 */

import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';
import type { ChatProviderId } from './providers';
import { getOpenRouterHeaders } from './providers';
import type { AIMessage } from './normalize-messages';
import { isRetriableStatus } from './retriable';
import type { StreamResult } from './gemini-stream';

interface OpenAIStreamOptions {
  providerId: ChatProviderId;
  apiKey: string;
  modelId: string;
  baseUrl?: string;
  messages: AIMessage[];
  stream: boolean;
}

/** Build the AI SDK model handle for the given provider */
function createModelHandle(
  providerId: ChatProviderId,
  apiKey: string,
  modelId: string,
  baseUrl?: string
) {
  switch (providerId) {
    case 'groq':
      return createGroq({ apiKey })(modelId);
    case 'openrouter':
      return createOpenAI({
        baseURL: baseUrl ?? 'https://openrouter.ai/api/v1',
        apiKey,
        headers: getOpenRouterHeaders(),
      }).chat(modelId);
    case 'openai':
      return createOpenAI({ apiKey })(modelId);
    case 'huggingface':
      // HF router speaks OpenAI-compatible chat/completions
      return createOpenAI({
        baseURL: baseUrl ?? 'https://router.huggingface.co/v1',
        apiKey,
      }).chat(modelId);
    default:
      throw new Error(`Unsupported OpenAI-compatible provider: ${providerId}`);
  }
}

/** Stream or generate via AI SDK for OpenAI-compatible providers */
export async function streamOpenAICompatible(
  options: OpenAIStreamOptions
): Promise<StreamResult> {
  const { providerId, apiKey, modelId, baseUrl, messages, stream } = options;
  const model = createModelHandle(providerId, apiKey, modelId, baseUrl);

  if (stream) {
    return streamText({
      model,
      messages,
      temperature: 0.7,
    });
  }

  return generateText({
    model,
    messages,
    temperature: 0.7,
  });
}

/**
 * Hugging Face router fallback via raw fetch when AI SDK routing fails.
 * Returns simulated streaming by chunking the full response (same contract as before).
 */
export async function streamHuggingFaceFetch(
  apiKey: string,
  modelId: string,
  messages: AIMessage[],
  stream: boolean
): Promise<StreamResult | null> {
  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    if (isRetriableStatus(response.status)) return null;
    return null;
  }

  const data = await response.json();
  let generatedText = '';

  if (data?.choices?.[0]?.message?.content) {
    generatedText = data.choices[0].message.content.trim();
  } else if (data?.choices?.[0]?.text) {
    generatedText = data.choices[0].text.trim();
  }

  if (!generatedText) return null;

  if (stream) {
    return {
      textStream: (async function* () {
        const words = generatedText.split(' ');
        for (const word of words) {
          yield word + ' ';
        }
      })(),
    };
  }

  return { text: generatedText };
}
