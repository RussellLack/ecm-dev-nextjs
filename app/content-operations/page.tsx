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
      "Strategy, governance, training, and workflow design — the operating-system layer that turns enterprise content from output into AI-ready infrastructure.",
    canonical: "/content-operations",
  });
}

// Mirrors the live `service-services` and `servicePackage` (category:
// "services") documents in Sanity, so this fallback (used only if Sanity
// isn't connected) reads the same as the CMS-managed page. Keep the two in
// sync when either one changes.
const fallbackData: ServicePageData = {
  title: "Content Operations",
  category: "services",
  heroDescription:
    "Content operations by design: governance, workflow, and measurement that scale without hiring.",
  problemIntro:
    "Somewhere between the brief and the dashboard, your content loses time, money, and momentum. The hard part is knowing exactly where.\n\nMost teams feel the symptoms long before they can name the cause — slow turnarounds, inconsistent quality, work that lands flat. So they treat the symptom: hire another writer, buy another tool, add another approval step. The friction just moves somewhere else.\n\nContent operations is the discipline of finding the real bottleneck — in how work is planned, briefed, made, reviewed, published, and measured — and fixing the system instead of the symptom. Pinpoint the weak stage and the team you already have moves faster, reworks less, and ships results you can actually prove.",
  diagnosisItems: [
    "Planning: work kicks off before anyone agrees what it's for or how you'll know it worked — so effort goes in with no way to defend it later.",
    "Briefing: \"good\" is never defined up front, so drafts come back for a second and third pass — adding days to every asset.",
    "Creation: your makers spend more time chasing context, assets, and sign-off than creating — often half the time billed to \"content\" isn't content at all.",
    "Review: approvals follow a different, undocumented route each time, and stall for days whenever one person is away.",
    "Ownership: once something is published, no one owns its quality or upkeep — so pages quietly go stale, and wrong.",
    "Duplication: a second team rebuilds content that already existed, and you pay twice for the same asset.",
    "Distribution: strong work ships into a void with no plan for who sees it — most of it is never seen again.",
    "Measurement: your reporting shows what was published, not what it changed — so budgets get defended on volume, not value.",
  ],
  reframeStatement:
    "You can't fix what you can't locate. We map your content operation stage by stage, find where time and value are actually leaking, and rebuild that part of the system — so the team you already have ships faster and can prove the impact.",
  ctaText:
    "Not sure which stage is costing you most? It scores your operation across planning, briefing, review, ownership, and measurement, and shows you the weakest link — in about ten minutes.",
  ctaUrl: "/assessments",
  packages: [
    { title: "Internal Capability Building", description: "We run practical training for the people who plan, produce, and review content — built around your actual standards, not generic best practice. The goal is to raise the operational floor, not just the ceiling.", features: ["Teams that share a common understanding of what good content looks like", "Reduced dependency on external review and approval", "Practical skills built around your real content types, not awareness training", "Faster onboarding for new team members"], order: 1 },
    { title: "Leadership Reporting & Internal Buy-In", description: "We help content operations leaders make the internal case for investment — through data-backed reports, clear business framing, and messaging that translates content metrics into language that resonates with finance and executive leadership.", features: ["A reporting format that demonstrates content's contribution to business outcomes", "Internal communication tools that build confidence in content investment", "A clear narrative connecting content operations to strategic priorities", "Reduced risk of content budget being cut when priorities shift"], order: 2 },
    { title: "Content Calendar & Publishing Architecture", description: "We design a structured publishing calendar that aligns content output with business objectives, audience behaviour, and seasonal demand — not just marketing instinct. The calendar becomes a planning tool rather than a reactive log.", features: ["A publishing architecture tied to revenue and growth goals", "Reduced last-minute production pressure through forward planning", "Consistent publishing cadence across teams and channels", "A calendar that survives leadership changes and strategy pivots"], order: 3 },
    { title: "Content Workflow Audit & Redesign", description: "We map your end-to-end content process, identify where it breaks down — handoffs, approvals, duplication, unclear ownership — and redesign it with explicit accountability and faster throughput. The output is a documented, implementable workflow, not a slide deck.", features: ["A redesigned workflow your team can actually follow", "Clear ownership at every stage of the content lifecycle", "Shorter cycle times without increasing headcount", "A process that scales as content volume grows"], order: 4 },
    { title: "Content Governance Framework", description: "We build the governance layer that most organisations skip: who decides what, how quality is maintained, what the content lifecycle looks like from creation to retirement. This is the infrastructure that stops content becoming an unmanaged liability as it scales.", features: ["Documented roles, responsibilities, and decision rights", "Quality standards and review criteria your team can apply consistently", "Content lifecycle management — including when content should be retired", "A governance model designed to reduce risk, not add bureaucracy"], order: 5 },
    { title: "Content Performance Measurement", description: "We connect content activity to business outcomes. That means designing the right KPIs, implementing reporting dashboards, and establishing a measurement rhythm so you know — week to week — what to continue, what to cut, and where to invest next.", features: ["KPIs that connect content to pipeline, retention, or conversion", "Reporting dashboards your leadership team can read without a briefing", "A measurement model that survives platform changes and team turnover", "The ability to make content decisions based on evidence, not opinion"], order: 6 },
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
