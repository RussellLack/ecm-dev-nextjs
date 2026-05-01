import type { MetadataRoute } from "next";

/**
 * robots.txt — generated dynamically by Next.js. The strategy is a
 * deliberate split, NOT a blanket "block AI bots":
 *
 *   ✓ ALLOW search-and-citation bots (Google, Bing, Perplexity*,
 *     OAI-SearchBot, Claude-SearchBot, etc.). These fetch content live
 *     to answer user queries WITH citations + click-through to ecm.dev.
 *     Blocking them would defeat the AEO/GEO work this site is built
 *     around.
 *
 *   ✗ BLOCK training-only crawlers (GPTBot, Google-Extended, CCBot,
 *     anthropic-ai, etc.). These ingest content into model weights —
 *     no traffic back, no citation. Vendors publish documented opt-out
 *     UAs specifically so sites like this one can refuse training while
 *     staying eligible for retrieval-time citation.
 *
 *   * PerplexityBot is the indexer that powers Perplexity citations.
 *     We allow it, accepting the calculated risk (Perplexity has been
 *     criticised for ignoring robots.txt at times). Citation traffic
 *     is the upside.
 *
 * The user-agents below are documented opt-outs published by each
 * vendor. Anything not listed here falls through to the default `*`
 * rule and is allowed.
 */

const TRAINING_ONLY_BOTS = [
  // OpenAI — training opt-out (search retrieval uses OAI-SearchBot, allowed)
  "GPTBot",
  // Google — Gemini/Bard training opt-out (Search uses Googlebot, allowed)
  "Google-Extended",
  // Common Crawl — feeds many training pipelines
  "CCBot",
  // Anthropic — legacy training opt-out (general crawl uses ClaudeBot, allowed)
  "anthropic-ai",
  // Cohere training
  "cohere-ai",
  // ByteDance / TikTok — aggressive training scraper
  "Bytespider",
  // Meta — AI training (separate from FacebookExternalHit which is link previews)
  "Meta-ExternalAgent",
  "FacebookBot",
  // Amazon training crawler
  "Amazonbot",
  // Apple — AI training opt-out (Search uses Applebot, allowed)
  "Applebot-Extended",
  // Commercial scraping services
  "Diffbot",
  "ImagesiftBot",
  // Content aggregators with unclear downstream use
  "Omgilibot",
  "Omgili",
  // Various aggressive scrapers commonly used to stockpile training data
  "PetalBot",
  "MJ12bot",
  "DotBot",
  "SemrushBot-OCOB",
  "SemrushBot-SWA",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow search engines + retrieval bots, exclude API + per-visitor result pages
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/assessment/*/results", "/assessment/cms-implementation/result/"],
      },
      // Explicit blocks for training-only crawlers
      ...TRAINING_ONLY_BOTS.map((userAgent) => ({
        userAgent,
        disallow: "/",
      })),
    ],
    sitemap: "https://ecm.dev/sitemap.xml",
  };
}
