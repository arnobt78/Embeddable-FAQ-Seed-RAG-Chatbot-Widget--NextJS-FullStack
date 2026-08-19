/**
 * Shared Sentry noise filters — report real app errors only.
 * Skips browser extensions, ad-blocker side effects, and benign browser quirks.
 */

import type { ErrorEvent } from "@sentry/core";

/** Benign client/server error messages — not actionable app bugs */
export const SENTRY_IGNORE_ERRORS: Array<string | RegExp> = [
  // Browser layout / rendering noise
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications",
  // Promise / script noise
  "Non-Error promise rejection captured",
  "Script error.",
  // Dynamic import / HMR (often network blips, not code bugs)
  /Loading chunk [\d]+ failed/,
  /Failed to fetch dynamically imported module/,
  // Extension globals injected into page context
  "top.GLOBALS",
  "canvas.contentDocument",
  "MyApp_RemoveAllHighlights",
  "atomicFindClose",
  // i18n / Intl polyfill edge cases
  /Intl\.(Segmenter|NumberFormat|DateTimeFormat)/,
  /Non-integer.*Intl/,
  // Network aborts (navigation away, tab close)
  "AbortError",
  "The operation was aborted",
  "NetworkError when attempting to fetch resource",
];

/** URL patterns for third-party injected scripts (extensions, translate, wallets) */
const THIRD_PARTY_SCRIPT_PATTERNS: RegExp[] = [
  /chrome-extension:\/\//i,
  /moz-extension:\/\//i,
  /safari-extension:\/\//i,
  /safari-web-extension:\/\//i,
  /extensions\//i,
  /grammarly/i,
  /googletranslate/i,
  /metamask/i,
  /lastpass/i,
  /honey/i,
  /react-devtools/i,
];

function collectEventText(event: ErrorEvent): string {
  const parts: string[] = [];

  if (event.message) parts.push(event.message);

  for (const ex of event.exception?.values ?? []) {
    if (ex.value) parts.push(ex.value);
    if (ex.type) parts.push(ex.type);
    for (const frame of ex.stacktrace?.frames ?? []) {
      if (frame.filename) parts.push(frame.filename);
      if (frame.abs_path) parts.push(frame.abs_path);
      if (frame.function) parts.push(frame.function);
    }
  }

  return parts.join("\n");
}

function isThirdPartyNoise(text: string): boolean {
  return THIRD_PARTY_SCRIPT_PATTERNS.some((pattern) => pattern.test(text));
}

/** Drop extension-injected and third-party script errors before send */
export function sentryBeforeSend(event: ErrorEvent): ErrorEvent | null {
  if (isThirdPartyNoise(collectEventText(event))) return null;
  return event;
}
