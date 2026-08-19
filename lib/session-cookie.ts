/** HttpOnly session cookie name for chatbot conversations */
export const SESSION_COOKIE_NAME = "chatbot_session";

/** Parse session id from Cookie header value */
export function parseSessionIdFromCookie(cookieHeader: string): string | undefined {
  const pattern = new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`);
  const match = cookieHeader.match(pattern);
  return match?.[1]?.trim() || undefined;
}

/** Set a new session cookie (30-day default matches SESSION_TTL env) */
export function buildSessionCookie(
  sessionId: string,
  maxAgeSeconds = 2592000
): string {
  return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

/** Expire session cookie on clear/delete */
export function buildClearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
