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
    category: "technology",
    fallbackTitle: "Content Technology",
    fallbackDescription: PILLAR_FALLBACKS.technology.metaDescription,
    canonical: "/content-technology",
  });
}

// Generated from the live Sanity `service-technology` + `servicePackage`
// documents by `npm run sync:pillars` — see lib/generated/pillarFallbacks.ts.
// Used only if Sanity isn't connected.
const fallbackData: ServicePageData = PILLAR_FALLBACKS.technology.data;

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
