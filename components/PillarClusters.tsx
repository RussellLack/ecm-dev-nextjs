import Link from "next/link";
import { urlFor } from "@/lib/sanity";
import {
  getCaseStudiesByPillar,
  getGuidesByPillar,
  getPostsByPillar,
} from "@/lib/queries";
import { getAssessmentsByPillar } from "@/lib/assessment/queries";

type Pillar = "technology" | "services" | "localization";

const HARDCODED_ASSESSMENT_LINKS: Record<Pillar, { title: string; href: string; subtitle: string }[]> = {
  technology: [],
  services: [
    {
      title: "Process Assessment",
      subtitle: "Map a key process and surface blockers and ownership gaps.",
      href: "/assessment/process",
    },
    {
      title: "Lead Magnet Ideation Tool",
      subtitle: "Find your best-fit lead magnet format and close capability gaps.",
      href: "/assessment/lead-magnet",
    },
  ],
  localization: [
    {
      title: "Localisation Cost Estimator",
      subtitle: "Six-layer cost model for multilingual content operations.",
      href: "/assessment/localisation-cost",
    },
  ],
};

/**
 * Cluster sections rendered at the foot of each pillar page. Pulls guides,
 * case studies, blog posts, and assessments tagged with the pillar so the
 * pillar page becomes a true topic hub rather than a leaf.
 *
 * Server component: queries run in parallel, results stream into the page.
 */
export default async function PillarClusters({ pillar }: { pillar: Pillar }) {
  const [guides, caseStudies, posts, dynamicAssessments] = await Promise.all([
    getGuidesByPillar(pillar, 4).catch(() => []),
    getCaseStudiesByPillar(pillar, 4).catch(() => []),
    getPostsByPillar(pillar, 4).catch(() => []),
    getAssessmentsByPillar(pillar, 4).catch(() => []),
  ]);

  const hardcodedAssessments = HARDCODED_ASSESSMENT_LINKS[pillar] ?? [];
  const hasAnyAssessment =
    hardcodedAssessments.length > 0 || (dynamicAssessments?.length ?? 0) > 0;

  if (
    !guides?.length &&
    !caseStudies?.length &&
    !posts?.length &&
    !hasAnyAssessment
  ) {
    return null;
  }

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 space-y-16">
        {guides?.length > 0 && (
          <Cluster
            heading="Guides on this topic"
            indexHref="/guides"
            indexLabel="All guides"
          >
            {guides.map((g: any) => (
              <Card
                key={g._id}
                href={`/guide/${g.slug?.current}`}
                title={g.title}
                subtitle={g.subtitle}
                image={g.mainImage}
                eyebrow={g.series}
              />
            ))}
          </Cluster>
        )}

        {caseStudies?.length > 0 && (
          <Cluster
            heading="Case studies"
            indexHref="/case-study"
            indexLabel="All projects"
          >
            {caseStudies.map((cs: any) => (
              <Card
                key={cs._id}
                href={`/case-study/${cs.slug?.current}`}
                title={cs.title}
                subtitle={cs.client || cs.description}
                image={cs.image}
              />
            ))}
          </Cluster>
        )}

        {posts?.length > 0 && (
          <Cluster
            heading="Recent thinking"
            indexHref="/blog"
            indexLabel="All articles"
          >
            {posts.map((p: any) => (
              <Card
                key={p._id}
                href={`/post/${p.slug?.current}`}
                title={p.title}
                subtitle={p.excerpt}
                image={p.mainImage}
              />
            ))}
          </Cluster>
        )}

        {hasAnyAssessment && (
          <Cluster
            heading="Self-assessments"
            indexHref="/assessments"
            indexLabel="All assessments"
          >
            {hardcodedAssessments.map((a) => (
              <Card
                key={a.href}
                href={a.href}
                title={a.title}
                subtitle={a.subtitle}
              />
            ))}
            {dynamicAssessments.map((a: any) => (
              <Card
                key={a._id}
                href={`/assessment/${a.slug?.current}`}
                title={a.title}
                subtitle={a.subtitle || a.introText}
              />
            ))}
          </Cluster>
        )}
      </div>
    </section>
  );
}

function Cluster({
  heading,
  indexHref,
  indexLabel,
  children,
}: {
  heading: string;
  indexHref: string;
  indexLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-6 gap-4">
        <h2 className="text-ecm-green font-barlow font-bold text-2xl lg:text-3xl">
          {heading}
        </h2>
        <Link
          href={indexHref}
          className="text-ecm-green text-sm font-barlow font-semibold hover:text-ecm-green-dark whitespace-nowrap"
        >
          {indexLabel} →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{children}</div>
    </div>
  );
}

function Card({
  href,
  title,
  subtitle,
  image,
  eyebrow,
}: {
  href: string;
  title: string;
  subtitle?: string;
  image?: any;
  eyebrow?: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-gray-50 rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-lg transition-all overflow-hidden flex flex-col"
    >
      <div className="h-32 overflow-hidden bg-ecm-green/5 flex items-center justify-center">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={urlFor(image).width(360).height(200).fit("crop").url()}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-ecm-green/30 text-xs font-barlow font-semibold tracking-widest">
            ECM
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        {eyebrow && (
          <p className="text-[10px] font-barlow font-semibold uppercase tracking-widest text-ecm-lime-hover mb-1">
            {eyebrow}
          </p>
        )}
        <h3 className="text-ecm-green font-barlow font-semibold text-sm leading-snug mb-2 group-hover:text-ecm-green-dark line-clamp-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-ecm-gray text-xs leading-relaxed line-clamp-3">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
