import type { Metadata } from "next";
import { getAssessment } from "@/lib/assessment/queries";
import AssessmentShell from "@/components/assessment/AssessmentShell";
import { notFound } from "next/navigation";

export const revalidate = 60;

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

  return <AssessmentShell assessment={assessment} />;
}
