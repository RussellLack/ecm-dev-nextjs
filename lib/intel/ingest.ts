import "server-only";
import Parser from "rss-parser";
import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { sanityIntelWriteClient as sanityWriteClient } from "@/lib/intel/sanity.write";

/**
 * Content Intelligence Engine — ingestion layer.
 *
 * Reads every active `intelSource` from Sanity, pulls its RSS feed, and
 * creates a new `intelArticle` document (status="raw") for each item we
 * haven't seen before.
 *
 * Dedup uses a SHA-1 of the normalised item URL stored in Netlify Blobs.
 * This keeps the hot path off Sanity. The hash is also persisted on the
 * article so we can rebuild the cache if Blobs state is ever lost.
 */

const parser = new Parser({ timeout: 15_000 });
const DEDUP_STORE = "intel-seen";

type SourceDoc = {
  _id: string;
  title: string;
  feedUrl: string;
  defaultTopics?: { _ref: string }[];
};

export type IngestResult = {
  source: string;
  added: number;
  skipped: number;
  errors: string[];
  newIds: string[];
};

function normaliseUrl(u: string): string {
  try {
    const x = new URL(u);
    x.hash = "";
    const tracking = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
      "fbclid",
      "mc_cid",
      "mc_eid",
    ];
    for (const p of tracking) x.searchParams.delete(p);
    return x.toString();
  } catch {
    return u;
  }
}

const urlHash = (u: string) =>
  createHash("sha1").update(normaliseUrl(u)).digest("hex");

export async function ingestAllSources(): Promise<IngestResult[]> {
  const sources = await sanityWriteClient.fetch<SourceDoc[]>(
    `*[_type == "intelSource" && active == true]{
      _id, title, feedUrl, defaultTopics
    }`
  );

  const seen = getStore(DEDUP_STORE);
  const results: IngestResult[] = [];

  for (const src of sources) {
    const r: IngestResult = {
      source: src.title,
      added: 0,
      skipped: 0,
      errors: [],
      newIds: [],
    };

    try {
      const feed = await parser.parseURL(src.feedUrl);
      for (const item of feed.items ?? []) {
        if (!item.link || !item.title) {
          r.skipped++;
          continue;
        }
        const hash = urlHash(item.link);
        if (await seen.get(hash)) {
          r.skipped++;
          continue;
        }

        const created = await sanityWriteClient.create({
          _type: "intelArticle",
          title: item.title,
          url: normaliseUrl(item.link),
          urlHash: hash,
          source: { _type: "reference", _ref: src._id },
          publishedDate:
            item.isoDate ?? item.pubDate ?? new Date().toISOString(),
          ingestedAt: new Date().toISOString(),
          rawContent:
            item.contentSnippet ?? item.content ?? item.summary ?? "",
          status: "raw",
          topics: src.defaultTopics ?? [],
        });

        await seen.set(hash, "1");
        r.added++;
        r.newIds.push(created._id);
      }

      await sanityWriteClient
        .patch(src._id)
        .set({
          lastFetchedAt: new Date().toISOString(),
          lastError: null,
        })
        .commit();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      r.errors.push(msg);
      try {
        await sanityWriteClient
          .patch(src._id)
          .set({ lastError: msg.slice(0, 500) })
          .commit();
      } catch {
        /* swallow — don't mask the original error */
      }
    }

    results.push(r);
  }

  return results;
}
