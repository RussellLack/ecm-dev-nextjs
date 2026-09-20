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
    category: "localization",
    fallbackTitle: "Content Localization",
    fallbackDescription:
      "Multilingual content that holds up, across languages, across markets, and under AI-assisted translation, with ongoing quality assurance as content gets added.",
    canonical: "/content-localization",
  });
}

// Static fallback in case Sanity isn't connected or the new editorial fields
// haven't been filled in yet. Only heroDescription + packages are provided;
// the problem/diagnosis/reframe/CTA sections collapse cleanly when empty.
const fallbackData: ServicePageData = {
  title: "Content Localization",
  category: "localization",
  heroDescription:
    "Multilingual content that holds up, across languages, across markets, and under AI-assisted translation. We start with a scoped estimate of what your localisation actually costs today, then run ongoing quality assurance as content gets added.",
  problemIntro: "",
  diagnosisItems: [],
  reframeStatement: "",
  ctaText: "",
  ctaUrl: "",
  packages: [
    { title: "Localisation Cost Estimator", description: "A scoped, honest estimate of what your localisation actually costs, before you commit to a vendor or a platform.", features: [], order: 1, href: "/assessment/localisation-cost" },
    { title: "Managed Multilingual Content", description: "Ongoing quality assurance across every language you publish in, catching drift and AI-translation errors as new content lands, not once a year.", features: [], order: 2 },
    { title: "Multilingual SEO", description: "hreflang, keyword localisation, and metadata translation, audited and fixed.", features: [], order: 3 },
    { title: "Translation Workflow Setup", description: "Tooling configured against your CMS so multilingual publishing doesn't require a manual handoff every time.", features: [], order: 4 },
  ],
};

export default async function ContentLocalizationPage() {
  const data =
    (await sanityFetch<ServicePageData | null>(getServicePageQuery, {
      category: "localization",
    }).catch(() => null)) ?? fallbackData;

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Content Localization Services",
          description: data.heroDescription,
          path: "/content-localization",
          serviceType: "Content Localization",
        })}
      />
      <ServicePage data={data} />
      <ContentAuditTiers />
      <PillarClusters pillar="localization" />
    </>
  );
}
