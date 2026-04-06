import { notFound, redirect } from "next/navigation";
import { getToolSubmission } from "@/lib/assessment/queries";
import ProcessResults from "@/components/assessment/ProcessResults";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Process Assessment Results | ECM.DEV",
    description:
      "Your process assessment pre-diagnostic brief — review, share, or download.",
    robots: { index: false, follow: false },
  };
}

export default async function ProcessResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ sid?: string }>;
}) {
  const { sid } = await searchParams;

  if (!sid) {
    redirect("/assessment/process");
  }

  const submission = await getToolSubmission(sid).catch(() => null);
  if (!submission || submission.toolType !== "process") notFound();

  // Parse the JSON results stored in Sanity
  let results;
  try {
    results =
      typeof submission.results === "string"
        ? JSON.parse(submission.results)
        : submission.results;
  } catch {
    notFound();
  }

  return (
    <ProcessResults
      submissionId={submission._id}
      submittedAt={submission.submittedAt}
      name={submission.name}
      role={submission.role}
      company={submission.company}
      results={results}
    />
  );
}
