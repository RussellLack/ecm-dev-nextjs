import { notFound, redirect } from "next/navigation";
import { getToolSubmission } from "@/lib/assessment/queries";
import LeadMagnetResults from "@/components/assessment/LeadMagnetResults";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Lead Magnet Analysis Results | ECM.DEV",
    description:
      "Your lead magnet ideation results — ranked formats, capability radar, and gap-closing actions.",
    robots: { index: false, follow: false },
  };
}

export default async function LeadMagnetResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ sid?: string }>;
}) {
  const { sid } = await searchParams;

  if (!sid) {
    redirect("/assessment/lead-magnet");
  }

  const submission = await getToolSubmission(sid).catch(() => null);
  if (!submission || submission.toolType !== "lead-magnet") notFound();

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
    <LeadMagnetResults
      submissionId={submission._id}
      submittedAt={submission.submittedAt}
      name={submission.name}
      role={submission.role}
      company={submission.company}
      results={results}
    />
  );
}
