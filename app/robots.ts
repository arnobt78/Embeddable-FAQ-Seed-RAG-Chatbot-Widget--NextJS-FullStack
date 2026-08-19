import type { MetadataRoute } from "next";

/**
 * Crawl policy — single source of truth (no public/robots.txt).
 * Disallow /api/ to reduce bot-driven edge/API invocations; allow homepage for SEO.
 * AI scraper UAs blocked explicitly; Vercel Firewall handles non-compliant bots.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/api/"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
        ],
        disallow: "/",
      },
    ],
  };
}
