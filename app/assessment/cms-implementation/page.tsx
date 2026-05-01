import type { Metadata } from "next";
import CmsImplementationClient from "@/components/assessment/cms-implementation/Client";
import AssessmentNextSteps from "@/components/assessment/AssessmentNextSteps";

export const metadata: Metadata = {
  title: "CMS Implementation Cost Estimator | ECM.DEV",
  description:
    "Self-serve TCO model for CMS, DXP and ECM platform projects. Twelve plain inputs in, a 3- or 5-year cost band and benefit-side estimate out. Take-away PDF gated only by email.",
  alternates: { canonical: "/assessment/cms-implementation" },
  openGraph: {
    title: "CMS Implementation Cost Estimator — ECM.DEV",
    description:
      "Build a defensible business case for your CMS / DXP / ECM project in five minutes. Coefficient ranges drawn from public analyst sources, calibrated by ECM.dev consulting work.",
    type: "website",
  },
};

export default function CmsImplementationAssessmentPage() {
  return (
    <>
      <CmsImplementationClient />
      <AssessmentNextSteps
        pillars={["technology", "services"]}
        currentSlug="cms-implementation"
      />
    </>
  );
}
