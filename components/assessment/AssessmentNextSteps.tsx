import Link from "next/link";
import { urlFor } from "@/lib/sanity";
import {
  getCaseStudiesByPillar,
  getGuidesByPillar,
  getPostsByPillar,
} from "@/lib/queries";
import { getAssessmentsByPillar } from "@/lib/assessment/queries";

type Pillar = "technology" | "services" | "localization";

const PILLAR_META: Record<Pillar, { title: string; href: string; blurb: string }> = {
  technology: {
    title: "Content Technology",
    href: "/content-technology",
    blurb:
      "Architecture, CMS / DAM / DXP selection, MarTech integration, and findability.",
  },
  services: {
    title: "Content Services",
    href: "/content-services",
    blurb: "Workflow design, governance, calendar, training, and measurement.",
  },
  localization: {
    title: "Content Localization",
    href: "/content-localization",
    blurb:
      "Multilingual operations, hreflang, translation tooling, and regional optimisation.",
  },
};

const HARDCODED_TOOLS: Array<{
  slug: string;
  title: string;
  href: string;
  subtitle: string;
  pillars: Pillar[];
}> = [
  {
    slug: "process",
    title: "Process Assessment",
    href: "/assessment/process",
    subtitle: "Map a key process and surface blockers and ownership gaps.",
    pillars: ["services"],
  },
  {
    slug: "lead-magnet",
    title: "Lead Magnet Ideation Tool",
    href: "/assessment/lead-magnet",
    subtitle:
      "Find your best-fit lead magnet format and close capability gaps.",
    pillars: ["services"],
  },
  {
    slug: "localisation-cost",
    title: "Localisation Cost Estimator",
    href: "/assessment/localisation-cost",
    subtitle: "Six-layer cost model for multilingual content operations.",
    pillars: ["localization"],
  },
];

/**
 * Cross-link block rendered at the foot of every assessment results page
 * (and the localisation-cost estimator page). Turns the assessment from a
 * dead-end into a hub: links to the matching service pillar, top related
 * guides and case studies, and the next-best assessment.
 *
 * Server component — queries run in parallel, results stream into the page.
 * Returns null if `pillars` is empty (e.g. an unrecognised assessment slug)
 * to avoid an empty section.
 */
export default async function AssessmentNextSteps({
  pillars,
  currentSlug,
  heading = "What to do next",
}: {
  pillars: Pillar[];
  currentSlug?: string;
  heading?: string;
}) {
  if (!pillars?.length) return null;
  const primary = pillars[0];
  const meta = PILLAR_META[primary];
  if (!meta) return null;

  const [guides, caseStudies, posts, dynamicAssessments] = await Promise.all([
    Promise.all(
      pillars.map((p) => getGuidesByPillar(p, 3).catch(() => []))
    ).then((lists) => dedupeBySlug(lists.flat()).slice(0, 3)),
    Promise.all(
      pillars.map((p) => getCaseStudiesByPillar(p, 2).catch(() => []))
    ).then((lists) => dedupeBySlug(lists.flat()).slice(0, 2)),
    Promise.all(
      pillars.map((p) => getPostsByPillar(p, 2).catch(() => []))
    ).then((lists) => dedupeBySlug(lists.flat()).slice(0, 2)),
    Promise.all(
      pillars.map((p) => getAssessmentsByPillar(p, 4).catch(() => []))
    ).then((lists) => dedupeBySlug(lists.flat())),
  ]);

  const otherTools = HARDCODED_TOOLS.filter(
    (t) => t.slug !== currentSlug && t.pillars.some((p) => pillars.includes(p))
  );

  const otherDynamic = (dynamicAssessments ?? []).filter(
    (a: any) => (a.slug?.current ?? a.slug) !== currentSlug
  );

  const nextAssessments: Array<{
    key: string;
    href: string;
    title: string;
    subtitle?: string;
  }> = [
    ...otherTools.map((t) => ({
      key: t.slug,
      href: t.href,
      title: t.title,
      subtitle: t.subtitle,
    })),
    ...otherDynamic.map((a: any) => ({
      key: a._id,
      href: `/assessment/${a.slug?.current}`,
      title: a.title,
      subtitle: a.subtitle || a.introText,
    })),
  ].slice(0, 3);

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl mb-3">
            {heading}
          </h2>
          <p className="text-ecm-gray font-barlow text-base max-w-2xl mx-auto">
            Based on what you've assessed, here's where to go deeper or get
            help.
          </p>
        </div>

        <Link
          href={meta.href}
          className="block bg-ecm-green rounded-2xl p-8 sm:p-10 hover:bg-ecm-green-dark transition-colors group"
        >
          <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-widest mb-2">
            Get expert help
          </p>
          <h3 className="text-ecm-lime font-barlow font-bold text-2xl sm:text-3xl mb-3 group-hover:text-white transition-colors">
            {meta.title}
          </h3>
          <p className="text-white/70 font-barlow text-base mb-5 max-w-2xl">
            {meta.blurb}
          </p>
          <span className="inline-flex items-center gap-2 bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-2.5 rounded-full">
            Explore {meta.title} →
          </span>
        </Link>

        {guides?.length > 0 && (
          <Cluster
            heading="Read next"
            indexHref="/guides"
            indexLabel="All guides"
          >
            {guides.map((g: any) => (
              <Card
                key={g._id}
                href={`/guide/${g.slug?.current}`}
                title={g.title}
                subtitle={g.subtitle || g.excerpt}
                image={g.mainImage}
                eyebrow={g.series}
              />
            ))}
          </Cluster>
        )}

        {caseStudies?.length > 0 && (
          <Cluster
            heading="See it in practice"
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

        {nextAssessments.length > 0 && (
          <Cluster
            heading="Try another assessment"
            indexHref="/assessments"
            indexLabel="All assessments"
          >
            {nextAssessments.map((a) => (
              <Card
                key={a.key}
                href={a.href}
                title={a.title}
                subtitle={a.subtitle}
              />
            ))}
          </Cluster>
        )}
      </div>
    </section>
  );
}

function dedupeBySlug<T extends { _id?: string; slug?: { current?: string } | string }>(
  items: T[]
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const slugStr =
      typeof item.slug === "string"
        ? item.slug
        : (item.slug?.current ?? item._id ?? "");
    if (slugStr && !seen.has(slugStr)) {
      seen.add(slugStr);
      out.push(item);
    }
  }
  return out;
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
      <div className="flex items-baseline justify-between mb-5 gap-4">
        <h3 className="text-ecm-green font-barlow font-bold text-xl lg:text-2xl">
          {heading}
        </h3>
        <Link
          href={indexHref}
          className="text-ecm-green text-sm font-barlow font-semibold hover:text-ecm-green-dark whitespace-nowrap"
        >
          {indexLabel} →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{children}</div>
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
      {image && (
        <div className="h-32 overflow-hidden bg-ecm-green/5 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlFor(image).width(360).height(200).fit("crop").url()}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        {eyebrow && (
          <p className="text-[10px] font-barlow font-semibold uppercase tracking-widest text-ecm-lime-hover mb-1">
            {eyebrow}
          </p>
        )}
        <h4 className="text-ecm-green font-barlow font-semibold text-sm leading-snug mb-2 group-hover:text-ecm-green-dark line-clamp-2">
          {title}
        </h4>
        {subtitle && (
          <p className="text-ecm-gray text-xs leading-relaxed line-clamp-3">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
