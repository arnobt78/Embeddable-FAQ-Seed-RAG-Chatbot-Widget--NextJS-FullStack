import { NextRequest } from 'next/server';
import { getSession, deleteSession } from '@/lib/redis';
import { getCorsHeaders } from '@/lib/api/cors';
import {
  buildClearSessionCookie,
  parseSessionIdFromCookie,
} from '@/lib/session-cookie';

export const runtime = 'edge';

const HISTORY_METHODS = 'GET, DELETE, OPTIONS';

export async function GET(req: NextRequest) {
  try {
    const origin = req.headers.get('origin');
    const cookieHeader = req.headers.get('cookie') || '';
    const sessionId = parseSessionIdFromCookie(cookieHeader);

    if (!sessionId) {
      return new Response(JSON.stringify({ messages: [] }), {
        status: 200,
        headers: getCorsHeaders(origin, HISTORY_METHODS),
      });
    }

    const session = await getSession(sessionId);

    return new Response(
      JSON.stringify({ messages: session?.messages || [] }),
      {
        status: 200,
        headers: getCorsHeaders(origin, HISTORY_METHODS),
      }
    );
  } catch (error) {
    console.error('History error:', error);
    const origin = req.headers.get('origin');
    return new Response(JSON.stringify({ messages: [] }), {
      status: 200,
      headers: getCorsHeaders(origin, HISTORY_METHODS),
    });
  }
}

/** DELETE — clear server session and expire cookie (idempotent) */
export async function DELETE(req: NextRequest) {
  try {
    const origin = req.headers.get('origin');
    const cookieHeader = req.headers.get('cookie') || '';
    const sessionId = parseSessionIdFromCookie(cookieHeader);

    if (sessionId) {
      await deleteSession(sessionId);
    }

    const headers = new Headers(getCorsHeaders(origin, HISTORY_METHODS));
    headers.set('Set-Cookie', buildClearSessionCookie());

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('History delete error:', error);
    const origin = req.headers.get('origin');
    return new Response(JSON.stringify({ error: 'Failed to clear session' }), {
      status: 500,
      headers: getCorsHeaders(origin, HISTORY_METHODS),
    });
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(origin, HISTORY_METHODS),
  });
}
