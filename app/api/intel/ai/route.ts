import { sanityFetch } from "@/lib/sanity.server";

/**
 * LLM-optimised intel feed.
 *
 * Returns up to 500 most-recent published articles as newline-delimited
 * JSON (application/x-ndjson) — one compact record per line, ordered by
 * publishedDate desc. Ideal for streaming into a downstream LLM or
 * retrieval pipeline.
 */

type AiFeedItem = {
  id: string;
  title: string;
  url: string;
  published_date: string | null;
  summary: string | null;
  key_insight: string | null;
  topics: string[];
  vendors: string[];
  content_angle: string | null;
};

export async function GET() {
  const query = `*[_type == "intelArticle" && status == "published"]
    | order(publishedDate desc) [0...500] {
      "id": _id,
      title,
      url,
      "published_date": publishedDate,
      summary,
      "key_insight": keyInsight,
      "topics": topics[]->title,
      "vendors": vendors[]->name,
      "content_angle": contentAngle
    }`;

  const items = await sanityFetch<AiFeedItem[]>(query);
  const body = items.map((i) => JSON.stringify(i)).join("\n");
  return new Response(body, {
    headers: { "content-type": "application/x-ndjson" },
  });
}
