/**
 * Gemini native streaming via @google/generative-ai.
 * Gemini does not use the OpenAI-compatible endpoint in this project — kept separate
 * so the primary free-tier provider (flash → flash-lite) streams without extra hops.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIMessage } from './normalize-messages';
import { getConversationMessages } from './normalize-messages';

export type StreamResult =
  | { textStream: AsyncIterable<string> }
  | { text: string };

/** Stream or generate a response from a specific Gemini model */
export async function streamGemini(
  apiKey: string,
  modelName: string,
  messages: AIMessage[],
  stream: boolean
): Promise<StreamResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const systemMsg = messages.find((m) => m.role === 'system');
  const conversation = getConversationMessages(messages);

  let prompt = (systemMsg?.content ?? '') + '\n\n';
  prompt += conversation
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const result = await model.generateContentStream(prompt);

  if (stream) {
    return {
      textStream: (async function* () {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) yield text;
        }
      })(),
    };
  }

  const response = await result.response;
  return { text: response.text() };
}
