import type { Metadata } from "next";
import CmsImplementationClient from "@/components/assessment/cms-implementation/Client";
import AssessmentNextSteps from "@/components/assessment/AssessmentNextSteps";
import AssessmentGate from "@/components/assessment/AssessmentGate";
import Link from "next/link";
import { TOOLS } from "@/lib/offers";

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
      {/* The estimator is step two. Anyone unsure a move is needed should
          rule out a setup problem first. */}
      <div className="bg-surface-alt border-b border-surface-border">
        <p className="max-w-5xl mx-auto px-6 py-3 text-sm text-ink">
          Not sure a move is needed?{" "}
          <Link
            href={TOOLS["platform-check"].href}
            className="font-semibold text-heading underline hover:no-underline"
          >
            Take the {TOOLS["platform-check"].name} first
          </Link>{" "}
          ({TOOLS["platform-check"].duration}, no email needed).
        </p>
      </div>
      <AssessmentGate
        slug="cms-implementation"
        title="CMS Implementation Cost Estimator"
      >
        <CmsImplementationClient />
      </AssessmentGate>
      <AssessmentNextSteps
        pillars={["technology", "services"]}
        currentSlug="cms-implementation"
      />
    </>
  );
}
