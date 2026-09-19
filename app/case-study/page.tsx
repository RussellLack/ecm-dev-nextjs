import { getCaseStudies } from "@/lib/queries";
import CaseStudyGrid from "@/components/CaseStudyGrid";

export const revalidate = 3600;

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

      {/* About this work */}
      <section className="py-14 sm:py-16 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-ecm-gray-dark text-base sm:text-lg leading-relaxed mb-4">
            ECM.DEV is a new vehicle for established expertise. Before establishing ECM.DEV, Russell Lack spent years working across digital platforms, content operations, analytics, international publishing and transformation programmes.
          </p>
          <p className="text-ecm-gray-dark text-base sm:text-lg leading-relaxed">
            The examples below include current and earlier work performed during the last decade. Each example is selected because it shows the scale, complexity and kinds of customer challenges that now shape how ECM.DEV works.
          </p>
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
