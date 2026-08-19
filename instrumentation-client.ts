/**
 * Client-side Sentry init via Next.js instrumentation (no layout client conversion).
 * tunnel sends events to /api/monitoring — same origin, not blocked by ad blockers.
 */

import * as Sentry from "@sentry/nextjs";
import {
  getClientSentryDsn,
  getTracesSampleRate,
  SENTRY_TUNNEL_ROUTE,
} from "./lib/sentry-env";
import {
  SENTRY_IGNORE_ERRORS,
  sentryBeforeSend,
} from "./lib/sentry-filters";

const dsn = getClientSentryDsn();

Sentry.init({
  dsn,
  enabled: !!dsn,
  tunnel: SENTRY_TUNNEL_ROUTE,
  tracesSampleRate: getTracesSampleRate(),
  environment: process.env.NODE_ENV || "development",
  debug: false,
  ignoreErrors: SENTRY_IGNORE_ERRORS,
  beforeSend: sentryBeforeSend,
});

/** App Router navigation tracing for Sentry performance */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
