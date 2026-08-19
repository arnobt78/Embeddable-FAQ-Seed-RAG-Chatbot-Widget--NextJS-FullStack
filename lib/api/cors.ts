/** Shared CORS headers for embeddable API routes (credentials + cross-origin) */
export function getCorsHeaders(
  origin: string | null,
  methods: string
): Record<string, string> {
  const allowedOrigin = origin || "*";
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Cookie, Authorization, x-seed-secret",
  };
}

/** CORS headers for SSE chat stream (no JSON content-type on stream body) */
export function getStreamCorsHeaders(
  origin: string | null,
  methods: string
): Record<string, string> {
  const allowedOrigin = origin || "*";
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Cookie",
  };
}
