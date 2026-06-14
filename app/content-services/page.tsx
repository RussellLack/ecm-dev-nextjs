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
    category: "services",
    fallbackTitle: "Content Services",
    fallbackDescription:
      "Strategy, governance, training, workflow design, and measurement — the operating-system layer that turns content from output into infrastructure.",
    canonical: "/content-services",
  });
}

// Static fallback in case Sanity isn't connected or the new editorial fields
// haven't been filled in yet. Only heroDescription + packages are provided;
// the problem/diagnosis/reframe/CTA sections collapse cleanly when empty.
const fallbackData: ServicePageData = {
  title: "Content Services",
  category: "services",
  heroDescription:
    "Designing effective content strategies, optimizing content workflows, and improving overall content performance. We can also train employees with the skills and knowledge to build a content marketing engine to support business growth strategies.",
  problemIntro: "",
  diagnosisItems: [],
  reframeStatement: "",
  ctaText: "",
  ctaUrl: "",
  packages: [
    { title: "Train Your Teams on What “Good Content” Looks Like", description: "We create and deliver a set of short, practical training modules that show your teams how to plan, review, and use content more effectively — tailored to their specific roles.", features: [], order: 1 },
    { title: "Improve Internal Buy-In for Your Content Work", description: "We help you showcase the business value of your content through data-backed reports, simple visuals, and messaging that resonates with leadership.", features: [], order: 2 },
    { title: "Build a Smarter Content Calendar", description: "We design a structured content calendar that aligns your publishing cadence with business goals, audience behaviour, and seasonal opportunities.", features: [], order: 3 },
    { title: "Audit & Fix Your Content Workflow", description: "We review your end-to-end content workflow, identify bottlenecks and inefficiencies, and deliver a redesigned process with clear ownership and faster turnaround.", features: [], order: 4 },
    { title: "Create a Content Governance Framework", description: "We build a practical governance framework covering roles, approvals, quality standards, and lifecycle management to reduce risk and improve consistency.", features: [], order: 5 },
    { title: "Measure What Your Content Actually Delivers", description: "We set up reporting dashboards and KPIs that connect content activity to business outcomes — so you know what’s working and what to cut.", features: [], order: 6 },
  ],
};

export default async function ContentServicesPage() {
  const data =
    (await sanityFetch<ServicePageData | null>(getServicePageQuery, {
      category: "services",
    }).catch(() => null)) ?? fallbackData;

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Content Services",
          description: data.heroDescription,
          path: "/content-services",
          serviceType: "Content Operations",
        })}
      />
      <ServicePage data={data} />
      <PillarClusters pillar="services" />
    </>
  );
}
