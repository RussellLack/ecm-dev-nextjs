import { getCaseStudies } from "@/lib/queries";
import CaseStudyGrid from "@/components/CaseStudyGrid";

export const revalidate = 60;

export const metadata = {
  title: "Projects | ECM.DEV",
  description:
    "Case studies in content technology, content services, and content localization.",
};

export default async function CaseStudyPage() {
  const caseStudies = await getCaseStudies();

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-28 pb-24 sm:pb-28 lg:pb-36 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            PROJECTS
          </h1>
        </div>
        {/* Wave divider: green → white */}
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <CaseStudyGrid caseStudies={caseStudies || []} />
        </div>
      </section>
    </>
  );
}
