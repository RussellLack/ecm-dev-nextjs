import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolSubmission } from "@/lib/assessment/queries";
import SharedResultClient from "@/components/assessment/cms-implementation/SharedResultClient";
import AssessmentNextSteps from "@/components/assessment/AssessmentNextSteps";
import type { CmsImplementationInputs } from "@/lib/assessment/cms-implementation/types";

// Blobs requires the Node runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "CMS Implementation TCO — Shared Result | ECM.DEV",
    description:
      "A shared CMS Implementation Cost Estimator result. Read-only view of someone's TCO estimate, with the same coefficient model and methodology as the live calculator.",
    alternates: {
      canonical: `/assessment/cms-implementation/result/${id}`,
    },
    robots: { index: false, follow: false },
    openGraph: {
      title: "CMS Implementation TCO — Shared Result",
      description:
        "Read-only view of a CMS Implementation TCO estimate from ECM.DEV.",
      type: "website",
    },
  };
}

export default async function SharedCmsImplementationResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const submission = await getToolSubmission(id).catch(() => null);
  if (!submission || submission.toolType !== "cms-implementation") {
    notFound();
  }

  // Inputs are JSON-stringified in the Blobs record (matches the existing
  // tool-submission shape).
  let inputs: CmsImplementationInputs;
  try {
    inputs =
      typeof submission.answers === "string"
        ? (JSON.parse(submission.answers) as CmsImplementationInputs)
        : (submission.answers as unknown as CmsImplementationInputs);
  } catch {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecm.dev";
  const shareableUrl = `${baseUrl}/assessment/cms-implementation/result/${id}`;

  return (
    <>
      <SharedResultClient
        inputs={inputs}
        shareableUrl={shareableUrl}
        submittedAt={submission.submittedAt}
      />
      <AssessmentNextSteps
        pillars={["technology", "services"]}
        currentSlug="cms-implementation"
      />
    </>
  );
}
