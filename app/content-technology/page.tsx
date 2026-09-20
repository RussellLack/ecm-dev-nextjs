import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity.server";
import { getServicePageQuery } from "@/lib/queries";
import { buildPillarMetadata } from "@/lib/pillarMetadata";
import ServicePage from "@/components/ServicePage";
import PillarClusters from "@/components/PillarClusters";
import ContentAuditTiers from "@/components/ContentAuditTiers";
import JsonLd from "@/components/JsonLd";
import { serviceSchema } from "@/lib/structuredData";
import type { ServicePageData } from "@/lib/serviceTypes";

export const revalidate = 3600;

// Editor-managed metadata (kept from main's May 1 work).
export async function generateMetadata(): Promise<Metadata> {
  return buildPillarMetadata({
    category: "technology",
    fallbackTitle: "Content Technology",
    fallbackDescription:
      "Your CMS, your platforms, and the data connecting them, working as one system. We start with a Content Audit, then run the fix as a standing technology function.",
    canonical: "/content-technology",
  });
}

// Static fallback in case Sanity isn't connected or the new editorial fields
// haven't been filled in yet. Only heroDescription + packages are provided;
// the problem/diagnosis/reframe/CTA sections collapse cleanly when empty.
const fallbackData: ServicePageData = {
  title: "Content Technology",
  category: "technology",
  heroDescription:
    "Your CMS, your platforms, and the data connecting them, working as one system instead of three separate problems. We start with a Content Audit that shows you exactly where the technology is breaking down, then run the fix as a standing technology function, not a one-off project.",
  problemIntro: "",
  diagnosisItems: [],
  reframeStatement: "",
  ctaText: "",
  ctaUrl: "",
  packages: [
    { title: "Content Audit", description: "A scored diagnostic of your CMS, structure, and integrations against a versioned rubric. Real findings from your actual estate, not a self-assessment questionnaire.", features: [], order: 1 },
    { title: "Managed Content Technology", description: "Standing technology stewardship: CMS architecture, MarTech and analytics integration, and a scheduled re-audit cadence so drift gets caught before it compounds.", features: [], order: 2 },
    { title: "CMS Architecture & Optimisation", description: "Fixing configuration issues, templates, and workflows so publishing gets faster and more consistent.", features: [], order: 3 },
    { title: "Platform & Analytics Integration", description: "Connecting your CMS to the tools that measure what content actually does, analytics, behavioural data, MarTech.", features: [], order: 4 },
    { title: "Findability & Structure", description: "Search, navigation, and information architecture that make content discoverable, for people and for AI systems reading it.", features: [], order: 5 },
  ],
};

export default async function ContentTechnologyPage() {
  const data =
    (await sanityFetch<ServicePageData | null>(getServicePageQuery, {
      category: "technology",
    }).catch(() => null)) ?? fallbackData;

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Content Technology",
          description: data.heroDescription,
          path: "/content-technology",
          serviceType: "Content Technology",
        })}
      />
      <ServicePage data={data} />
      <ContentAuditTiers />
      <PillarClusters pillar="technology" />
    </>
  );
}
