import LeadMagnetAssessment from "@/components/assessment/LeadMagnetAssessment";

export const metadata = {
  title: "Lead Magnet Ideation Tool | ECM.DEV",
  description:
    "Answer 13 questions and get three ranked lead magnet recommendations with topic ideas, a capability radar, and specific gap-closing actions.",
};

export default function LeadMagnetPage() {
  return <LeadMagnetAssessment />;
}
