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
import { PILLAR_FALLBACKS } from "@/lib/generated/pillarFallbacks";

export const revalidate = 3600;

// Editor-managed metadata (kept from main's May 1 work).
export async function generateMetadata(): Promise<Metadata> {
  return buildPillarMetadata({
    category: "localization",
    fallbackTitle: "Content Localization",
    fallbackDescription: PILLAR_FALLBACKS.localization.metaDescription,
    canonical: "/content-localization",
  });
}

// Generated from the live Sanity `service-localization` + `servicePackage`
// documents by `npm run sync:pillars` — see lib/generated/pillarFallbacks.ts.
// Used only if Sanity isn't connected.
const fallbackData: ServicePageData = PILLAR_FALLBACKS.localization.data;

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
