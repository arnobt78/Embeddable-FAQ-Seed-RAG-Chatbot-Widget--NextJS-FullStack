import { timingSafeEqual } from "crypto";

export type SeedAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; message: string };

/** Extract bearer token or x-seed-secret header from request */
function extractProvidedSecret(request: Request): string | undefined {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  const headerSecret = request.headers.get("x-seed-secret")?.trim();
  if (headerSecret) return headerSecret;

  return undefined;
}

/** Constant-time compare — rejects length mismatch without leaking timing */
function secretsMatch(expected: string, provided: string): boolean {
  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(provided, "utf8");
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

/**
 * Verify seed endpoint authorization.
 * SEED_SECRET must be set in env — returns 503 if missing (fail closed).
 */
export function verifySeedSecret(request: Request): SeedAuthResult {
  const configured = process.env.SEED_SECRET?.trim();
  if (!configured) {
    return {
      ok: false,
      status: 503,
      message: "Seed endpoint not configured",
    };
  }

  const provided = extractProvidedSecret(request);
  if (!provided) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  if (!secretsMatch(configured, provided)) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  return { ok: true };
}
