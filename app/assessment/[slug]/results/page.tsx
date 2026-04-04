import { notFound, redirect } from "next/navigation";
import { getSubmission, getMaturityBands, getServiceRecommendations } from "@/lib/assessment/queries";
import ResultsDashboard from "@/components/assessment/ResultsDashboard";
import type { Metadata } from "next";
import type { Recommendation } from "@/lib/assessment/types";

export const dynamic = "force-dynamic"; // always fetch fresh submission data

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return {
    title: `Your Results | ECM.DEV`,
    description: "Your personalised content operations maturity assessment results",
    robots: { index: false, follow: false },
  };
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sid?: string }>;
}) {
  const { slug } = await params;
  const { sid } = await searchParams;

  if (!sid) {
    redirect(`/assessment/${slug}`);
  }

  const submission = await getSubmission(sid).catch(() => null);
  if (!submission) notFound();

  // Fetch bands + recommendations for enriched display
  const [bands, recommendations] = await Promise.all([
    getMaturityBands(submission.assessment._id).catch(() => []),
    getServiceRecommendations().catch(() => []),
  ]);

  // Find the matching band for full content
  const band = bands.find(
    (b: any) =>
      submission.totalScore >= b.minScore && submission.totalScore <= b.maxScore
  ) || bands[0];

  // Map recommendations for weak areas
  const weakAreas: string[] = submission.weakAreas || [];
  const mappedRecs: Recommendation[] = [];
  const categoryToHref: Record<string, string> = {
    technology: "/content-technology",
    services: "/content-services",
    localization: "/content-localization",
  };

  for (const dimKey of weakAreas) {
    const matching = recommendations
      .filter(
        (r: any) =>
          r.dimension?.key?.current === dimKey &&
          submission.bandLevel <= (r.minBandLevel || 4)
      )
      .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0));

    for (const rec of matching.slice(0, 2)) {
      mappedRecs.push({
        title: rec.title,
        summary: rec.summary || "",
        dimensionKey: dimKey,
        dimensionTitle:
          submission.dimensionScores?.find((d: any) => d.dimensionKey === dimKey)
            ?.dimensionTitle || dimKey,
        serviceHref: rec.service
          ? categoryToHref[rec.service.category] || "/contact"
          : undefined,
        serviceTitle: rec.service?.title,
      });
    }
  }

  return (
    <ResultsDashboard
      submissionId={sid}
      firstName={submission.firstName || ""}
      totalScore={submission.totalScore}
      bandTitle={band?.title || submission.bandTitle || ""}
      bandHeadline={band?.headline || ""}
      bandDescription={band?.description || ""}
      bandColor={band?.color || "#6B7280"}
      bandLevel={submission.bandLevel}
      dimensionScores={submission.dimensionScores || []}
      weakAreas={weakAreas}
      recommendations={mappedRecs}
      resultsIntro={submission.assessment?.resultsIntro}
      ctaHeading={submission.assessment?.resultsCtaHeading}
      ctaBody={submission.assessment?.resultsCtaBody}
    />
  );
}
