import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity.server";
import { getServicePageQuery } from "@/lib/queries";
import { buildPillarMetadata } from "@/lib/pillarMetadata";
import ServicePage from "@/components/ServicePage";
import PillarClusters from "@/components/PillarClusters";
import JsonLd from "@/components/JsonLd";
import { serviceSchema } from "@/lib/structuredData";
import type { ServicePageData } from "@/lib/serviceTypes";

export const revalidate = 60;

// Editor-managed metadata (kept from main's May 1 work).
export async function generateMetadata(): Promise<Metadata> {
  return buildPillarMetadata({
    category: "localization",
    fallbackTitle: "Content Localization",
    fallbackDescription:
      "Multilingual content operations, translation management, regional findability, and AI-native localisation — making content scale across languages and markets.",
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
    "Our marketing collateral localization services offer a combination of machine translation with human editing to ensure high-quality translations. These packages cover documents, websites, presentations, social media posts, graphics, and videos.",
  problemIntro: "",
  diagnosisItems: [],
  reframeStatement: "",
  ctaText: "",
  ctaUrl: "",
  packages: [
    { title: "Fast Turnaround Translation – 4 Hour Delivery", description: "Get urgent, premium translations in 4 business hours — every time. Our subscription lets teams rely on fast, consistent translations in fixed language pairs, with no drop in quality or tone.", features: [], order: 1 },
    { title: "Large Localization Package", description: "A full-scale content localization solution for large websites, product documentation, or platform UIs. Designed to deliver consistency, speed, and language accuracy across multiple regions and content formats.", features: [], order: 2 },
    { title: "Find & Fix Underperforming Global Content", description: "We help you identify which content is underperforming in specific markets and deliver actionable recommendations to improve relevance, engagement, and conversions.", features: [], order: 3 },
    { title: "Multilingual SEO Optimisation", description: "We audit and optimise your multilingual content for search engines — including hreflang implementation, keyword localisation, and metadata translation.", features: [], order: 4 },
    { title: "Website Translation Setup & Configuration", description: "We set up and configure translation management tools integrated with your CMS, ensuring efficient workflows for ongoing multilingual content delivery.", features: [], order: 5 },
    { title: "Marketing Collateral Localization", description: "We localise documents, presentations, social media posts, graphics, and videos with machine translation enhanced by human editing for quality assurance.", features: [], order: 6 },
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
      <PillarClusters pillar="localization" />
    </>
  );
}
