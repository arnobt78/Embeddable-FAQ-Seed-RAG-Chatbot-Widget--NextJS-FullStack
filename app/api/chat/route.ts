import { NextRequest } from 'next/server';
import { getSession, saveSession, type ChatMessage } from '@/lib/redis';
import { searchFAQ } from '@/lib/rag';
import { getAIResponse } from '@/lib/ai';
import { getStreamCorsHeaders } from '@/lib/api/cors';
import {
  buildSessionCookie,
  parseSessionIdFromCookie,
} from '@/lib/session-cookie';
import { chatPostBodySchema, formatZodError } from '@/lib/schemas';

export const runtime = 'edge';

const CHAT_METHODS = 'POST, OPTIONS';

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = chatPostBodySchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: formatZodError(parsed.error) }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { message } = parsed.data;

    const cookieHeader = req.headers.get('cookie') || '';
    const existingSessionId = parseSessionIdFromCookie(cookieHeader);
    let sessionId: string = existingSessionId || '';
    let session = sessionId ? await getSession(sessionId) : null;

    if (!session) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      session = {
        id: sessionId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    session.messages.push(userMessage);

    const context = await searchFAQ(message);
    const result = await getAIResponse(session.messages, context, true);

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';

        try {
          interface StreamResult {
            textStream?: AsyncIterable<string>;
            text?: string;
          }
          const streamResult = result as StreamResult;
          const textStream = streamResult?.textStream;

          if (textStream && typeof textStream[Symbol.asyncIterator] === 'function') {
            for await (const chunk of textStream) {
              if (chunk) {
                fullResponse += chunk;
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ response: chunk })}\n\n`)
                );
              }
            }
          } else if (streamResult?.text) {
            fullResponse = streamResult.text;
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ response: fullResponse })}\n\n`)
            );
          } else {
            throw new Error('No textStream or text found in AI response');
          }

          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: fullResponse,
            timestamp: Date.now(),
          };
          session!.messages.push(assistantMessage);
          session!.updatedAt = Date.now();
          await saveSession(sessionId!, session!.messages);

          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Streaming failed' })}\n\n`)
          );
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    const origin = req.headers.get('origin');
    const headers = new Headers(getStreamCorsHeaders(origin, CHAT_METHODS));

    if (!existingSessionId) {
      const ttl = parseInt(process.env.SESSION_TTL || '2592000', 10);
      headers.set('Set-Cookie', buildSessionCookie(sessionId, ttl));
    }

    return new Response(stream, { headers });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  const allowedOrigin = origin || '*';
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': CHAT_METHODS,
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    },
  });
}
