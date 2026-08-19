/**
 * Message normalization for multi-provider chat APIs.
 * Ensures all message content is a plain string regardless of upstream format
 * (string, array of parts, or object with text/content fields).
 */

export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type RawMessage = {
  role: string;
  content: string | unknown[] | { text?: string; content?: string; message?: string };
};

/** Convert any message content shape to a plain string */
export function normalizeContentToString(content: unknown): string {
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content
      .map((item: unknown) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const obj = item as { text?: string; content?: string; message?: string };
          return obj.text || obj.content || obj.message || '';
        }
        return String(item ?? '');
      })
      .filter((text: string) => text.length > 0)
      .join(' ');
  }

  if (content && typeof content === 'object') {
    const obj = content as { text?: string; content?: string; message?: string };
    return obj.text || obj.content || obj.message || '';
  }

  return String(content ?? '');
}

/** Normalize raw session messages and build the full prompt array with system + FAQ context */
export function buildAIMessages(
  rawMessages: RawMessage[],
  systemPrompt: string,
  context?: string
): AIMessage[] {
  const normalized = rawMessages
    .slice(-6)
    .map((msg) => {
      const content = normalizeContentToString(msg.content).trim();
      if (!content) return null;

      const role =
        msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user';

      return { role: role as AIMessage['role'], content };
    })
    .filter((msg): msg is AIMessage => msg !== null);

  const systemContent = systemPrompt + (context ? `\n\nFAQ Context:\n${context}` : '');

  return [{ role: 'system', content: systemContent }, ...normalized];
}

/** Conversation turns only (no system) — used by Gemini native prompt builder */
export function getConversationMessages(messages: AIMessage[]): AIMessage[] {
  return messages.filter((m) => m.role !== 'system');
}
