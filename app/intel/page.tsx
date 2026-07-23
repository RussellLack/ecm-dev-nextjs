import type { Metadata } from "next";
import {
  getActiveIntelTopics,
  getPublishedIntelArticles,
} from "@/lib/intel/queries";
import IntelBoard from "./IntelBoard";

export const metadata: Metadata = {
  title: "Intel — industry signal, curated",
  description:
    "AI-enriched briefings on Enterprise Content Management, CMS, ContentOps, and AI-for-content. Pulled from industry feeds and filtered for decision-useful signal.",
};

// Cache for 1 hour at the edge; the intel publish/reject Studio actions
// fire /api/revalidate to refresh this immediately when content changes.
export const revalidate = 3600;

export default async function IntelPage() {
  const [articles, topics] = await Promise.all([
    getPublishedIntelArticles(100),
    getActiveIntelTopics(),
  ]);

  return <IntelBoard articles={articles ?? []} topics={topics ?? []} />;
}
