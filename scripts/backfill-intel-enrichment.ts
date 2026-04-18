/**
 * Backfill enrichment for intelArticle documents in status="raw".
 *
 * The Sanity webhook only fires for NEW document creations going
 * forward. Articles that were ingested before the webhook was wired up
 * never triggered the processor, so this script walks status="raw" docs
 * and enriches them in bounded-concurrency batches.
 *
 * Usage (from intel-studio for ANTHROPIC key, or from repo root — either
 * way, env vars must be present):
 *
 *   NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID=288or5eh \
 *   NEXT_PUBLIC_SANITY_INTEL_DATASET=production \
 *   SANITY_INTEL_API_WRITE_TOKEN=<editor-token> \
 *   ANTHROPIC_API_KEY=<your-anthropic-key> \
 *   npx tsx scripts/backfill-intel-enrichment.ts [--limit=50] [--concurrency=3]
 *
 * Idempotent: enrichArticle overwrites enriched fields and flips status
 * to "enriched" (or "published" for autoPublish sources). Re-running
 * picks up anything still in status="raw".
 */

import { enrichArticle } from "../lib/intel/process";
import { sanityIntelWriteClient } from "../lib/intel/sanity.write";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((a) => a.replace(/^--/, "").split("="))
    .map(([k, v]) => [k, v ?? "true"])
);

const LIMIT = Number(args.limit ?? 0);
const CONCURRENCY = Math.max(1, Math.min(Number(args.concurrency ?? 3), 8));

type RawRef = { _id: string; title: string };

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!process.env.SANITY_INTEL_API_WRITE_TOKEN) {
    throw new Error("SANITY_INTEL_API_WRITE_TOKEN is not set");
  }

  const total = await sanityIntelWriteClient.fetch<number>(
    `count(*[_type == "intelArticle" && status == "raw"])`
  );
  console.log(`${total} article(s) in status="raw".`);

  const query = LIMIT > 0
    ? `*[_type == "intelArticle" && status == "raw"] | order(ingestedAt asc) [0...$limit] { _id, title }`
    : `*[_type == "intelArticle" && status == "raw"] | order(ingestedAt asc) { _id, title }`;

  const docs = await sanityIntelWriteClient.fetch<RawRef[]>(query, {
    limit: LIMIT,
  });
  console.log(
    `Enriching ${docs.length} article(s) with concurrency=${CONCURRENCY}.\n`
  );

  let ok = 0;
  let fail = 0;
  const failures: { id: string; title: string; error: string }[] = [];

  const queue = [...docs];
  async function worker(i: number) {
    while (queue.length) {
      const doc = queue.shift()!;
      const idx = docs.length - queue.length;
      process.stdout.write(`[${idx}/${docs.length}] ${doc.title.slice(0, 70)} `);
      try {
        await enrichArticle(doc._id);
        ok++;
        console.log("✓");
      } catch (e) {
        fail++;
        const msg = e instanceof Error ? e.message : String(e);
        failures.push({ id: doc._id, title: doc.title, error: msg });
        console.log(`✗ ${msg.slice(0, 80)}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) => worker(i))
  );

  console.log(
    `\nDone. enriched=${ok}, failed=${fail}, total=${docs.length}.`
  );
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  ${f.id} — ${f.error}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
