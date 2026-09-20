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
      "CMS, DAM and DXP selection, MarTech integration, search and findability: picking the right content platforms and connecting them properly.",
    canonical: "/content-technology",
  });
}

// Mirrors the live `service-technology` and `servicePackage` (category:
// "technology") documents in Sanity, so this fallback (used only if Sanity
// isn't connected) reads the same as the CMS-managed page. Keep the two in
// sync when either one changes.
const fallbackData: ServicePageData = {
  title: "Content Technology",
  category: "technology",
  heroDescription:
    "We fix the operational layer that determines whether your content technology (CMS, DAM, AI) performs, as a retained function, not a full-time hire.",
  problemIntro:
    "You bought the platform. The performance didn't come in the box.\n\nEnterprise content technology rarely fails because the tools are bad. It fails in the space between them: the model that doesn't fit how you work, the integration nobody finished, the search that returns everything except the thing you needed. The licence renews; the value never quite arrives.\n\nThe fix isn't another platform. It's making the stack you have actually perform: choosing the right tools for how your teams really work, connecting them so content and data flow, and architecting it so people, and increasingly AI, can find and reuse what's there. Get that operational layer right and the technology you've already paid for finally earns its keep.",
  diagnosisItems: [
    "Selection: tools were chosen on feature lists and demos, not how teams work, so you pay enterprise licences for features no one touches.",
    "Architecture: your content model fights how content is really made and reused, taxing every project with workarounds.",
    "Integration: CMS, DAM, analytics, and CRM don't talk, so staff re-enter the same data by hand: hours a week, every week.",
    "Migration: the last replatform copied the old mess into a new system, so you paid to rebuild the same problems.",
    "Findability: people and AI tools can't reliably find what's published, so it gets recreated instead of reused.",
    "Adoption: the platform can do it, but people work around it: you're paying for capability you don't use.",
    "Governance: every team configures the tools their own way, and the inconsistency compounds with each release.",
    "Measurement: you can't connect what the stack costs to what it returns, so renewals get rubber-stamped on faith.",
  ],
  reframeStatement:
    "Tools don't deliver outcomes: the system around them does. We pin down where your stack actually breaks down (selection, architecture, integration, findability) and rebuild that layer, so the platforms you've already paid for finally perform.",
  ctaText:
    "Not sure whether the problem is the platform or the way it's set up? It scores your stack across selection, architecture, integration, and findability, and shows you the weakest link, in about ten minutes.",
  ctaUrl: "/assessments",
  packages: [
    { title: "CMS Audit & Operational Redesign", description: "We examine your CMS configuration, workflow design, template architecture, and governance model, not just the platform settings. We identify where publishing friction is introduced, where ownership breaks down, and where the system is working against the team rather than for it. The output is an implementable redesign, not a capability assessment.", features: ["A clear diagnosis of where your CMS is failing and why", "Redesigned workflows, templates, and configuration aligned with how teams actually work", "Faster publishing with fewer workarounds", "A CMS that teams use rather than route around"], order: 1 },
    { title: "Content Architecture & Metadata Design", description: "We design the content models and metadata frameworks that determine whether your content is findable, reusable, and AI-ready. This is the foundational work that most platform implementations skip, and the gap that explains why personalisation fails, search underperforms, and localisation costs more than it should.", features: ["Structured content models designed for reuse across channels and markets", "A metadata framework that makes content findable and machine-readable", "The structural foundation for AI tools to work reliably", "Reduced duplication and redundant production effort"], order: 2 },
    { title: "MarTech Integration & Content Flow Design", description: "We connect your content platform with the wider digital ecosystem (analytics, marketing automation, CRM, personalisation engines) and design the data flows that allow content to move correctly between systems. The goal is not integration for its own sake. It is content that reaches the right context with the right data attached.", features: ["Content that flows correctly between CMS, CRM, and marketing automation", "Analytics that reflect real content performance, not platform activity", "A connected stack that reduces manual export and duplication", "The data foundation that personalisation and AI tools require"], order: 3 },
    { title: "Digital Asset Management Implementation", description: "We implement or optimise your DAM environment, not just the platform configuration, but the taxonomy, governance, and workflow design that determines whether teams actually use it. A DAM that teams cannot navigate consistently is a storage problem, not a brand asset system.", features: ["A DAM environment with a taxonomy teams can apply consistently", "Governance that prevents asset proliferation and version confusion", "Workflows that connect asset management to publishing and localisation", "Reduced time spent searching for, recreating, or re-requesting assets"], order: 4 },
    { title: "Enterprise Search & Content Findability", description: "When content cannot be found, it does not exist. We design and implement search experiences (across intranets, websites, and content repositories) that make enterprise content genuinely retrievable, not just theoretically available.", features: ["Search that reflects how people actually look for information", "Reduced time spent finding content that already exists", "Lower duplication caused by teams who cannot find what has already been produced", "Search architecture that scales as content volume grows"], order: 5 },
    { title: "Platform Selection & Technology Advisory", description: "When selection is genuinely the right next step, we advise on it: evaluating CMS, DAM, and DXP options against your operational reality rather than vendor feature matrices. We are not affiliated with any platform vendor. We have no commercial reason to recommend one system over another.", features: ["A technology recommendation based on your workflows, not vendor positioning", "Clear evaluation criteria that survive procurement and stakeholder pressure", "An unbiased view of build, buy, and configure trade-offs", "Reduced risk of a platform investment that replicates the current problem"], order: 6 },
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
