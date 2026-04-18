import { NextResponse } from "next/server";
import { sanityFetch } from "@/lib/sanity.server";

/**
 * Newsletter digest endpoint.
 *
 * Returns published intel articles from the last 7 days (or since the
 * ISO timestamp supplied in `?since=`). Shape is the same as /feed but
 * trimmed to the fields most useful in a newsletter template.
 */

type NewsletterItem = {
  title: string;
  url: string;
  source: string;
  summary: string | null;
  key_insight: string | null;
  topics: string[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since =
    searchParams.get("since") ??
    new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const query = `*[_type == "intelArticle" && status == "published"
    && publishedDate > $since]
    | order(publishedDate desc) {
      title,
      url,
      "source": source->title,
      summary,
      "key_insight": keyInsight,
      "topics": topics[]->title
    }`;

  const items = await sanityFetch<NewsletterItem[]>(query, { since });
  return NextResponse.json({ since, count: items.length, items });
}
