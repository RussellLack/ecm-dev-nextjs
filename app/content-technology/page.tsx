import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity.server";
import { getServicePageQuery } from "@/lib/queries";
import { buildPillarMetadata } from "@/lib/pillarMetadata";
import ServicePage from "@/components/ServicePage";
import PillarClusters from "@/components/PillarClusters";
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
      "CMS / DAM / DXP selection, MarTech integration, search and findability, content architecture — picking the right platforms and connecting them properly.",
    canonical: "/content-technology",
  });
}

// Static fallback in case Sanity isn't connected or the new editorial fields
// haven't been filled in yet. Only heroDescription + packages are provided;
// the problem/diagnosis/reframe/CTA sections collapse cleanly when empty.
const fallbackData: ServicePageData = {
  title: "Content Technology",
  category: "technology",
  heroDescription:
    "Elevate your content with cutting-edge technology. Maximize your content’s potential with our Content Technology Management Services. We offer advisory and implementation services to help you create, manage, store, and distribute content seamlessly across multiple channels.",
  problemIntro: "",
  diagnosisItems: [],
  reframeStatement: "",
  ctaText: "",
  ctaUrl: "",
  packages: [
    { title: "Build a Better Navigation & Site Structure", description: "We redesign your navigation and site hierarchy so content is easy to find, logically organised, and aligned with how users actually search and browse.", features: [], order: 1 },
    { title: "Optimise Your CMS for Efficiency", description: "We audit your current CMS setup, fix configuration issues, and streamline templates and workflows to make content publishing faster and more consistent.", features: [], order: 2 },
    { title: "Integrate Content with Your MarTech Stack", description: "We connect your CMS with analytics, marketing automation, CRM, and other tools — so content flows seamlessly across your digital ecosystem.", features: [], order: 3 },
    { title: "Set Up Digital Asset Management", description: "We implement or optimise your DAM platform to centralise brand assets, reduce duplication, and ensure teams always find the right file fast.", features: [], order: 4 },
    { title: "Enterprise Search & Findability", description: "We design and implement search experiences that make content discoverable across intranets, websites, and content repositories.", features: [], order: 5 },
    { title: "Content Platform Selection & Advisory", description: "We evaluate CMS, DAM, and DXP options against your real needs — cutting through vendor noise to recommend the right fit for your organisation.", features: [], order: 6 },
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
          name: "Content Technology Consulting",
          description: data.heroDescription,
          path: "/content-technology",
          serviceType: "Content Technology",
        })}
      />
      <ServicePage data={data} />
      <PillarClusters pillar="technology" />
    </>
  );
}
