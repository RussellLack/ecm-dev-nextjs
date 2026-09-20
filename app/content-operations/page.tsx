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
    fallbackDescription:
      "Governance, ownership, workflow, and lifecycle: ongoing work, not a one-off report that goes stale in a month.",
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
    "Content that has an owner, a workflow, and a reason it still exists. We find out where the operation breaks down. Then, if you want, we keep running it with you as a managed package: governance, ownership, and lifecycle, not a one-off report that goes stale in a month.",
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
