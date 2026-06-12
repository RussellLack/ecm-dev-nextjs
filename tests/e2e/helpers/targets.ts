/**
 * Discovers the full set of assessment URLs to test against a given origin.
 *
 * The set is NOT a fixed list: `/assessment/[slug]` is a generic, Sanity-driven
 * route, so the live catalogue grows as assessments are published. We therefore
 * union:
 *   1. the bespoke (hardcoded React) assessment routes, and
 *   2. every `/assessment/<slug>` entry URL found in the target's sitemap.xml.
 *
 * No Sanity token is needed — the sitemap is public and already emits one entry
 * per published assessment (see app/sitemap.ts).
 */

export interface AssessmentTarget {
  slug: string;
  url: string;
}

/** Bespoke assessment routes that are not Sanity documents. */
export const BESPOKE_SLUGS = [
  "lead-magnet",
  "process",
  "localisation-cost",
  "cms-implementation",
] as const;

/** Matches an assessment *entry* page only: exactly one segment after /assessment/. */
const ASSESSMENT_ENTRY = /^\/assessment\/([^/]+)\/?$/;

export async function getAssessmentTargets(
  baseURL: string,
): Promise<AssessmentTarget[]> {
  const origin = baseURL.replace(/\/+$/, "");
  const map = new Map<string, AssessmentTarget>();

  // Explicit override (e.g. ASSESSMENT_SLUGS=lead-magnet,process) — run only
  // the named slugs and skip sitemap discovery. Handy for local/targeted runs.
  const override = process.env.ASSESSMENT_SLUGS?.trim();
  if (override) {
    for (const slug of override.split(",").map((s) => s.trim()).filter(Boolean)) {
      map.set(slug, { slug, url: `${origin}/assessment/${slug}` });
    }
    return [...map.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  }

  // 1. Bespoke routes are always covered.
  for (const slug of BESPOKE_SLUGS) {
    map.set(slug, { slug, url: `${origin}/assessment/${slug}` });
  }

  // 2. Discover Sanity-authored assessments from the live sitemap.
  const sitemapUrl = `${origin}/sitemap.xml`;
  const res = await fetch(sitemapUrl, { headers: { accept: "application/xml" } });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch sitemap (${res.status} ${res.statusText}) from ${sitemapUrl}`,
    );
  }
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

  for (const loc of locs) {
    let pathname: string;
    try {
      pathname = new URL(loc).pathname;
    } catch {
      continue; // skip malformed <loc>
    }
    const match = pathname.match(ASSESSMENT_ENTRY);
    if (!match) continue; // excludes /results, /methodology, /result/[id], the listing, etc.
    const slug = match[1];
    map.set(slug, { slug, url: `${origin}/assessment/${slug}` });
  }

  return [...map.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}
