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

/**
 * Fire one request at every target, in parallel, and wait for them all to
 * settle — before the timed Playwright test ever navigates to one.
 *
 * Netlify's Next.js runtime serves each dynamic route from its own
 * serverless function. A function that hasn't been hit since the last deploy
 * pays a cold-start penalty (10-40s+) on its *first* invocation. The smoke
 * spec's own `page.goto()` uses Playwright's default navigation timeout
 * (~30s), which is unrelated to and shorter than the per-test timeout the
 * spec already scales to the target count — so a cold function can time out
 * a navigation even though the test as a whole has plenty of budget left.
 * Warming every route once here, outside any per-test timeout, means the
 * timed run only ever hits already-warm functions.
 *
 * A single attempt isn't always enough, though: moments after a fresh
 * deploy the preview's DNS/edge routing can still be settling, which fails
 * outright ("fetch failed" — connection refused / not yet resolvable)
 * rather than timing out. That's a different failure mode than cold-start
 * latency and needs a retry with a short pause, not a longer timeout. Each
 * target therefore gets up to 3 attempts with a 3s pause between them
 * before it's logged as failed.
 *
 * Failures are logged, not thrown — a route that's still unreachable after
 * every retry will fail loudly and correctly in the real test, with a real
 * error, instead of being masked here.
 */
const WARM_UP_MAX_ATTEMPTS = 3;
const WARM_UP_RETRY_DELAY_MS = 3_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function warmTarget(
  target: AssessmentTarget,
): Promise<{ slug: string; ok: boolean; status: number; ms: number; attempts: number; error?: string }> {
  const started = Date.now();
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= WARM_UP_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(target.url, { signal: AbortSignal.timeout(45_000) });
      if (res.ok) {
        return { slug: target.slug, ok: true, status: res.status, ms: Date.now() - started, attempts: attempt };
      }
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    if (attempt < WARM_UP_MAX_ATTEMPTS) await sleep(WARM_UP_RETRY_DELAY_MS);
  }

  return {
    slug: target.slug,
    ok: false,
    status: 0,
    ms: Date.now() - started,
    attempts: WARM_UP_MAX_ATTEMPTS,
    error: lastError,
  };
}

export async function warmTargets(targets: AssessmentTarget[]): Promise<void> {
  const results = await Promise.all(targets.map(warmTarget));

  console.log(`[warm-up] pinged ${results.length} target(s):`);
  for (const r of results) {
    const detail = r.error ? ` (${r.error})` : "";
    console.log(
      `  - ${r.slug.padEnd(26)} ${r.ok ? "ok" : "FAILED"} attempt ${r.attempts}/${WARM_UP_MAX_ATTEMPTS} ${r.ms}ms${detail}`,
    );
  }
}
