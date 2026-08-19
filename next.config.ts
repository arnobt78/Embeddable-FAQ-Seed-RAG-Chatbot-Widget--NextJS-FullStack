import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/** Security headers applied to all routes — see docs/VERCEL_PRODUCTION_GUARDRAILS.md */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Content-hashed build assets — safe to cache forever; reduces bot re-fetch churn
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          ...securityHeaders,
        ],
      },
      {
        // All other routes get security headers only (no cache override)
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

// Sentry: source maps at build time; tunnelRoute proxies client events via same-origin /api/monitoring
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  tunnelRoute: "/api/monitoring",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
});
