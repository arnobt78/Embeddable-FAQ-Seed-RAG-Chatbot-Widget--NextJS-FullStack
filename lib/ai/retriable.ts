/**
 * Retriable failure classification for the provider fallback orchestrator.
 * Retriable errors advance to the next model/provider; non-retriable errors stop immediately.
 */

const RETRIABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

/** HTTP response status indicates a transient/upstream failure worth retrying */
export function isRetriableStatus(status: number): boolean {
  return RETRIABLE_STATUS_CODES.has(status);
}

/** Rate limit — skip remaining models in the same provider (fast-skip per LLM_MODEL_SELECTION.md) */
export function isRateLimited(error: unknown, status?: number): boolean {
  if (status === 429) return true;
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('429') ||
    message.includes('quota') ||
    message.includes('Too Many Requests') ||
    message.includes('rate limit')
  );
}

/** Classify whether an error should trigger the next model in the chain */
export function isRetriableError(error: unknown, status?: number): boolean {
  if (status !== undefined && isRetriableStatus(status)) return true;
  if (isRateLimited(error, status)) return true;

  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('timeout') ||
    message.includes('ECONNRESET') ||
    message.includes('fetch failed') ||
    message.includes('503') ||
    message.includes('502') ||
    message.includes('500') ||
    message.includes('deprecated') ||
    message.includes('not found') ||
    message.includes('404') ||
    message.includes('410')
  );
}
