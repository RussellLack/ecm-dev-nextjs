import { NextResponse } from "next/server";
import { sanityIntelFetch as sanityFetch } from "@/lib/intel/sanity";

/**
 * Public website feed for Content Intelligence Engine articles.
 *
 * Query params:
 *   - limit  (1-100, default 20)
 *   - topic  (optional intelTopic slug — filters articles that have it)
 */

export const revalidate = 300;

type FeedItem = {
  id: string;
  title: string;
  url: string;
  source: { title: string; url: string | null };
  published_date: string | null;
  summary: string | null;
  key_insight: string | null;
  topics: string[];
  vendors: string[];
  content_angle: string | null;
  linkedin_post: string | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? 20), 1),
    100
  );
  const topic = searchParams.get("topic");

  const topicFilter = topic
    ? "&& count(topics[@->slug.current == $topic]) > 0"
    : "";

  const query = `*[_type == "intelArticle" && status == "published" ${topicFilter}]
    | order(publishedDate desc) [0...$limit] {
      "id": _id,
      title,
      url,
      "source": source->{ "title": title, "url": homepageUrl },
      "published_date": publishedDate,
      summary,
      "key_insight": keyInsight,
      "topics": topics[]->title,
      "vendors": vendors[]->name,
      "content_angle": contentAngle,
      "linkedin_post": linkedinPost
    }`;

  const items = await sanityFetch<FeedItem[]>(query, { limit, topic });
  return NextResponse.json({ items });
}
