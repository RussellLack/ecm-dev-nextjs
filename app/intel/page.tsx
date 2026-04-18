import type { Metadata } from "next";
import { sanityIntelFetch as sanityFetch } from "@/lib/intel/sanity";
import IntelBoard, { type IntelArticle, type IntelTopic } from "./IntelBoard";

export const metadata: Metadata = {
  title: "Intel — industry signal, curated",
  description:
    "AI-enriched briefings on Enterprise Content Management, CMS, ContentOps, and AI-for-content. Pulled from industry feeds and filtered for decision-useful signal.",
};

// Cache the feed for 5 minutes at the edge. Publishes from Sanity
// invalidate naturally via the next build or revalidation.
export const revalidate = 300;

export default async function IntelPage() {
  const [articles, topics] = await Promise.all([
    sanityFetch<IntelArticle[]>(
      `*[_type == "intelArticle" && status == "published"]
        | order(publishedDate desc) [0...100] {
          "id": _id,
          title,
          url,
          "source": source->{ "title": title, "url": homepageUrl },
          "publishedDate": publishedDate,
          summary,
          "keyInsight": keyInsight,
          "topics": topics[]->{ "title": title, "slug": slug.current },
          "vendors": vendors[]->name,
          "contentAngle": contentAngle
        }`
    ),
    sanityFetch<IntelTopic[]>(
      `*[_type == "intelTopic"] | order(title asc) {
         "title": title, "slug": slug.current
       }`
    ),
  ]);

  return <IntelBoard articles={articles ?? []} topics={topics ?? []} />;
}
