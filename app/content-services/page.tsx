import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/lib/sanity.server";
import { getServicePageQuery } from "@/lib/queries";
import { buildPillarMetadata } from "@/lib/pillarMetadata";
import ServicePage from "@/components/ServicePage";
import PillarClusters from "@/components/PillarClusters";
import JsonLd from "@/components/JsonLd";
import { serviceSchema } from "@/lib/structuredData";
import type { ServicePageData } from "@/lib/serviceTypes";

/* Content AI-Readiness Audit tiers. Static (not Sanity-sourced), same
   reasoning as the homepage's former engagement-tiers section: pricing goes
   through code review, not a CMS edit. Moved here so these descriptions
   have a permanent home off the homepage. */
const auditTiers = [
  {
    kicker: "First real proof",
    title: "Snapshot",
    price: "From €2,000",
    meta: "5–7 business days · a real sample of your estate",
    description:
      "ecm-agent scans a genuine sample of your content, up to 100 items or 10% of the estate. A 5–10 page report, your top five findings, and one or two shown actually failing in an AI answer. 45-minute recorded readout.",
    note: "100% credited toward a Full Estate Audit if you sign within 30 days.",
  },
  {
    kicker: "Full proof, board-ready",
    title: "Full Estate Audit",
    price: "From €12,000",
    meta: "3–4 weeks · your whole estate",
    description:
      "Every finding family available, scored across your full content estate, and a 20–30 page board-ready report with a costed remediation roadmap. 90-minute stakeholder readout, plus two weeks of async Q&A.",
  },
];

export const revalidate = 3600;

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

      {/* ─── CONTENT AI-READINESS AUDIT TIERS (static, see auditTiers) ─── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-ecm-green/70 font-barlow font-semibold text-xs tracking-widest uppercase mb-3">
            Content AI-Readiness Audit
          </p>
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            Deeper proof, when you need it in writing.
          </h2>
          <p className="text-ecm-gray-dark text-center text-base mb-16 max-w-2xl mx-auto">
            ecm-agent scans your actual content estate rather than relying on
            self-reporting. Two depths, both fixed scope.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {auditTiers.map((tier) => (
              <div
                key={tier.title}
                className="relative bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20 flex flex-col"
              >
                <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-wide mb-1">
                  {tier.kicker}
                </p>
                <h3 className="text-ecm-lime font-barlow font-bold text-xl mb-1">{tier.title}</h3>
                <p className="text-white font-barlow font-bold text-2xl mb-1">{tier.price}</p>
                <p className="text-white/60 text-xs mb-4">{tier.meta}</p>
                <p className="text-white/85 text-sm leading-relaxed mb-4 flex-1">{tier.description}</p>
                {tier.note && (
                  <p className="text-ecm-lime/80 text-xs italic mb-4">{tier.note}</p>
                )}
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors mt-auto"
                >
                  Talk about a {tier.title}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-ecm-gray-dark text-xs mt-8 max-w-2xl mx-auto">
            All prices exclude VAT where applicable.
          </p>
        </div>
      </section>

      <PillarClusters pillar="services" />
    </>
  );
}
