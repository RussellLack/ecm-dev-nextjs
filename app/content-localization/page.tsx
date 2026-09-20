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
      "Multilingual content operations, translation management, regional findability, and AI-native localisation — content that scales across markets.",
    canonical: "/content-localization",
  });
}

// Mirrors the live `service-localization` and `servicePackage` (category:
// "localization") documents in Sanity, so this fallback (used only if
// Sanity isn't connected) reads the same as the CMS-managed page. Keep the
// two in sync when either one changes.
const fallbackData: ServicePageData = {
  title: "Content Localization",
  category: "localization",
  heroDescription:
    "Content localisation that scales — we fix the system, not just the translation, as a retained function, not a full-time hire.",
  problemIntro:
    "Going global rarely fails at the translation. It fails everywhere around it.\n\nWhen content scales across languages and markets, the cracks are usually upstream and downstream of the actual translating — source content that was never built to be localised, handoffs that lose context, terminology that drifts from market to market, and pages that, once translated, no one in-region can find. Costs climb, timelines slip, and quality turns into a matter of luck.\n\nLocalisation is really about engineering the whole flow: preparing source content so it travels well, designing handoffs that keep context intact, and making translated content discoverable and measurable in every market. Fix the system and you scale into new languages faster, cheaper, and without the quality lottery.",
  diagnosisItems: [
    "Source readiness: content isn't written to be localised, so every language costs more and takes longer than it should.",
    "Workflow: handoffs lose context, so meaning and tone drift — and fixing it after the fact costs more than getting it right once.",
    "Terminology: key terms come back different in every market, eroding trust and forcing rework.",
    "Turnaround: each market is a one-off scramble, so timelines slip and launches wait on translation.",
    "Quality: you only learn a translation was off when a customer in-market complains — after the damage is done.",
    "Findability: translated pages aren't set up to rank (hreflang, regional SEO), so you pay to create content no one finds.",
    "Reuse: the same content gets re-translated from scratch, so you pay again for words you already own.",
    "Measurement: you can't see which markets your localised content works in, so spend keeps spreading blind.",
  ],
  reframeStatement:
    "Translation is the easy part — the system around it is where global content wins or loses. We find where your localisation flow leaks time, cost, and quality — from source readiness to in-market findability — and rebuild that part, so you scale into new languages without the guesswork.",
  ctaText:
    "Not sure where your localisation flow is costing you most? It scores your operation from source readiness through in-market findability and shows you the weakest link — in about ten minutes.",
  ctaUrl: "/assessments",
  packages: [
    { title: "Localisation Health Check", description: "A structured diagnostic of your current localisation operation — source content quality, workflow design, vendor relationships, tooling, and cost structure. The output is a clear picture of where the waste is and what to address first. This is where most clients start.", features: ["A clear diagnosis of your current localisation cost drivers", "Prioritised recommendations with effort-to-impact estimates", "A baseline for measuring improvement as changes are made", "Insight your leadership team can use to make investment decisions"], order: 1 },
    { title: "Source Content Restructuring", description: "We restructure source content — the content that enters the translation pipeline — so it is consistent, reusable, and designed for translation efficiency. This is the single highest-leverage intervention for reducing localisation cost. Fixing the source reduces translation volume, revision cycles, and regional divergence simultaneously.", features: ["Source content that is consistent, concise, and translation-ready", "Reduced translation volume through reuse and deduplication", "Fewer revision cycles caused by ambiguous or inconsistent source", "A source content standard your team can maintain going forward"], order: 2 },
    { title: "Localisation Workflow Design", description: "We design the end-to-end localisation workflow — from content creation through translation, local review, and regional publishing — with clear ownership, defined handoffs, and integrated tooling. The workflow exists in a system, not in someone's inbox.", features: ["A documented localisation process with accountable ownership at each stage", "Shorter translation cycles through parallel workflows and automation", "Consistent output quality across regions and vendors", "A workflow that scales as you enter new markets without rebuilding from scratch"], order: 3 },
    { title: "Translation Technology Setup", description: "We configure and integrate the translation management systems and CMS connectors that automate the movement of content through your localisation pipeline. The goal is to remove the manual steps that add time and introduce error — not to replace human judgment with automation.", features: ["Translation management tooling configured to your workflow", "CMS-to-TMS integration that eliminates manual export and import", "Automated routing that gets content to the right translator or review step", "Reduced operational overhead for the team managing the pipeline"], order: 4 },
    { title: "Global Content Performance Audit", description: "We identify which content is underperforming in specific markets — using search data, engagement signals, and conversion analysis — and deliver recommendations grounded in local audience behaviour, not assumptions about what should work in a given region.", features: ["Market-level content performance data you can act on", "Prioritised improvement recommendations per region", "A clearer picture of where localisation investment is and isn't delivering", "Insight that prevents you from localising content that shouldn't be localised"], order: 5 },
    { title: "Scalable Localisation Programme", description: "For organisations operating across multiple markets with ongoing localisation requirements, we design and manage the full operational programme — governance, vendor management, technology, quality assurance, and continuous improvement. This is localisation as an operational capability, not a project.", features: ["A localisation operation that scales with market expansion", "Consistent quality and turnaround across markets, vendors, and content types", "A governance model that prevents regional divergence and rework", "Cost per word and cycle time that improve as the programme matures"], order: 6 },
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
