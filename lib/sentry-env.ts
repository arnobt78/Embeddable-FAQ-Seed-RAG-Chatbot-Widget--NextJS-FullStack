/**
 * Shared Sentry DSN resolution for client, server, and edge runtimes.
 * Client uses NEXT_PUBLIC_SENTRY_DSN; server/edge prefer SENTRY_DSN with public fallback.
 */

/** Browser/client DSN — must be NEXT_PUBLIC_ prefixed */
export function getClientSentryDsn(): string | undefined {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return dsn || undefined;
}

/** Node.js server + edge DSN — server alias overrides public when set */
export function getServerSentryDsn(): string | undefined {
  const dsn =
    process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return dsn || undefined;
}

/** Production uses lower sample rate to limit overhead on free tier */
export function getTracesSampleRate(): number {
  return process.env.NODE_ENV === "production" ? 0.1 : 1.0;
}

/** Same-origin tunnel path — bypasses ad blockers that block ingest.sentry.io */
export const SENTRY_TUNNEL_ROUTE = "/api/monitoring";
