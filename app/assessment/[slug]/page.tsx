import type { Metadata } from "next";
import { getAssessment } from "@/lib/assessment/queries";
import AssessmentShell from "@/components/assessment/AssessmentShell";
import AssessmentGate from "@/components/assessment/AssessmentGate";
import { UNGATED_ASSESSMENT_SLUGS } from "@/lib/offers";
import { notFound } from "next/navigation";

export const revalidate = 3600;

/**
 * Sanity-authored assessments in UNGATED_ASSESSMENT_SLUGS (lib/offers.ts)
 * skip the registration gate. Content Operations Maturity is the front door
 * promised by every homepage CTA ("no email needed"), so it stays open;
 * every other assessment keeps the email gate by default.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const assessment = await getAssessment(slug);
  if (!assessment) return {};

  const seo = assessment.seo || {};
  const title = seo.metaTitle || assessment.title;
  const description =
    seo.metaDescription ||
    assessment.introText ||
    `Take the ${assessment.title} on ECM.DEV.`;

  return {
    title,
    description,
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const assessment = await getAssessment(slug);

  if (!assessment) {
    notFound();
  }

  if (UNGATED_ASSESSMENT_SLUGS.has(slug)) {
    return <AssessmentShell assessment={assessment} />;
  }

  return (
    <AssessmentGate slug={slug} title={assessment.title}>
      <AssessmentShell assessment={assessment} />
    </AssessmentGate>
  );
}
