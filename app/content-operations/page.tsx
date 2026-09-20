import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity.server";
import { getServicePageQuery } from "@/lib/queries";
import { buildPillarMetadata } from "@/lib/pillarMetadata";
import ServicePage from "@/components/ServicePage";
import PillarClusters from "@/components/PillarClusters";
import ContentAuditTiers from "@/components/ContentAuditTiers";
import LearnMoreSection from "@/components/LearnMoreSection";
import JsonLd from "@/components/JsonLd";
import { serviceSchema } from "@/lib/structuredData";
import type { ServicePageData } from "@/lib/serviceTypes";
import { topicSlides } from "@/lib/learnMoreSlides";
import { PILLAR_FALLBACKS } from "@/lib/generated/pillarFallbacks";

// Moved here from the homepage (see docs/SERVICE-CLARITY-AUDIT-2026-09-20.md):
// every deck is now a Content Operations deep dive, so this is where they
// belong, read before the pricing ask below rather than as generic homepage
// filler. Cards are derived directly from topicSlides, the same source the
// modal reads from, so there is no second title list that can drift out of
// sync with it (that drift broke the homepage cards once already).
const learnMoreItems = topicSlides.map((t) => ({
  title: t.title,
  subtitle: t.subtitle,
}));

export const revalidate = 3600;

// Editor-managed metadata (kept from main's May 1 work).
export async function generateMetadata(): Promise<Metadata> {
  return buildPillarMetadata({
    category: "services",
    fallbackTitle: "Content Operations",
    fallbackDescription: PILLAR_FALLBACKS.services.metaDescription,
    canonical: "/content-operations",
  });
}

// Generated from the live Sanity `service-services` + `servicePackage`
// documents by `npm run sync:pillars` — see lib/generated/pillarFallbacks.ts.
// Used only if Sanity isn't connected.
const fallbackData: ServicePageData = PILLAR_FALLBACKS.services.data;

export default async function ContentOperationsPage() {
  const data =
    (await sanityFetch<ServicePageData | null>(getServicePageQuery, {
      category: "services",
    }).catch(() => null)) ?? fallbackData;

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Content Operations",
          description: data.heroDescription,
          path: "/content-operations",
          serviceType: "Content Operations",
        })}
      />
      <ServicePage data={data} />

      <section className="relative py-20 bg-surface-alt">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            Go deeper on Content Operations
          </h2>
          <p className="text-ink text-center text-base mb-16 max-w-2xl mx-auto">
            Ten short explainers on governance, workflow, and how a diagnostic turns into an ongoing managed package, before you look at pricing.
          </p>
          <LearnMoreSection items={learnMoreItems} />
        </div>
      </section>

      <ContentAuditTiers />
      <PillarClusters pillar="services" />
    </>
  );
}
