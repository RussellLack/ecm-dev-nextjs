import LeadMagnetAssessment from "@/components/assessment/LeadMagnetAssessment";
import AssessmentGate from "@/components/assessment/AssessmentGate";

export const metadata = {
  title: "Lead Magnet Ideation Tool | ECM.DEV",
  description:
    "Answer 13 questions and get three ranked lead magnet recommendations with topic ideas, a capability radar, and specific gap-closing actions.",
};

export default function LeadMagnetPage() {
  return (
    <AssessmentGate slug="lead-magnet" title="Lead Magnet Ideation Tool">
      <LeadMagnetAssessment />
    </AssessmentGate>
  );
}
