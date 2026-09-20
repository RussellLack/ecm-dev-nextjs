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
    category: "services",
    fallbackTitle: "Content Operations",
    fallbackDescription:
      "Governance, ownership, workflow, and lifecycle — run as a standing function, not a one-off report that goes stale in a month.",
    canonical: "/content-operations",
  });
}

// Static fallback in case Sanity isn't connected or the new editorial fields
// haven't been filled in yet. Only heroDescription + packages are provided;
// the problem/diagnosis/reframe/CTA sections collapse cleanly when empty.
const fallbackData: ServicePageData = {
  title: "Content Operations",
  category: "services",
  heroDescription:
    "Content that has an owner, a workflow, and a reason it still exists. We diagnose where the operation breaks down, then run it with you as a standing function, governance, ownership, lifecycle, not a one-off report that goes stale in a month.",
  problemIntro: "",
  diagnosisItems: [],
  reframeStatement: "",
  ctaText: "",
  ctaUrl: "",
  packages: [
    { title: "Content Operations Assessment", description: "A scored look at ownership, workflow, and decision rights across your content estate. Where the bottlenecks actually are, not where you assume they are.", features: [], order: 1 },
    { title: "Managed Content Operations", description: "Standing governance and workflow stewardship: a documented operating model, a decision cadence, and someone accountable for keeping it current.", features: [], order: 2 },
    { title: "Governance Framework", description: "Roles, approvals, quality standards, and lifecycle management, built to actually get used, not filed away.", features: [], order: 3 },
    { title: "Workflow Redesign", description: "End-to-end review of how content moves from idea to published, with bottlenecks named and ownership assigned.", features: [], order: 4 },
    { title: "Measurement That Connects to Outcomes", description: "Reporting that ties content activity to what the business actually cares about, so you know what to keep and what to cut.", features: [], order: 5 },
  ],
};

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
      <ContentAuditTiers />
      <PillarClusters pillar="services" />
    </>
  );
}
