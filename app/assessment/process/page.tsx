import ProcessAssessment from "@/components/assessment/ProcessAssessment";
import AssessmentGate from "@/components/assessment/AssessmentGate";

export const metadata = {
  title: "Process Assessment | ECM.DEV",
  description:
    "Map a key business process, surface blockers and ownership gaps, and generate a pre-diagnostic brief for your first consultant call.",
};

export default function ProcessAssessmentPage() {
  return (
    <AssessmentGate slug="process" title="Process Assessment">
      <ProcessAssessment />
    </AssessmentGate>
  );
}
