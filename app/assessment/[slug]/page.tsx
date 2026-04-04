import { getAssessment } from "@/lib/assessment/queries";
import AssessmentShell from "@/components/assessment/AssessmentShell";
import { notFound } from "next/navigation";

export const revalidate = 60;

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
