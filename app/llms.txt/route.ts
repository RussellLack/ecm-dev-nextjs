import { sanityFetch } from "@/lib/sanity.server";

/**
 * llms.txt — a Markdown map of the site for AI agents that fetch a page
 * live to answer a user's question. Follows the llmstxt.org convention:
 * H1 title, blockquote description, then curated H2 sections with links.
 *
 * Kept intentionally curated (top items per section) rather than
 * exhaustive — the sitemap already covers full enumeration for crawlers.
 * llms.txt is the "front door" for an agent trying to figure out what
 * this site is and where to look first.
 *
 * Regenerated on request rather than pre-built, so newly published
 * Sanity content shows up without a redeploy.
 */

const SITE_URL = "https://ecm.dev";

// Small caps so the file stays scannable (< 200 lines) — agents don't
// need every item, just enough to know where to look.
const TOP_CASE_STUDIES = 20;
const TOP_GUIDES = 15;
const TOP_POSTS = 15;

type Doc = {
  title: string;
  slug: string;
  description?: string;
};

async function fetchTop<T extends Doc>(
  type: string,
  order: string,
  limit: number,
  projection = ""
): Promise<T[]> {
  try {
    return await sanityFetch<T[]>(
      `*[_type == $type && defined(slug.current)] | order(${order})[0...$limit]{
        title,
        "slug": slug.current,
        description${projection}
      }`,
      { type, limit }
    );
  } catch {
    return [];
  }
}

function section(heading: string, intro: string | null, lines: string[]): string {
  if (lines.length === 0) return "";
  return [
    `## ${heading}`,
    "",
    ...(intro ? [intro, ""] : []),
    ...lines,
    "",
  ].join("\n");
}

function link(path: string, title: string, description?: string): string {
  const desc = description?.replace(/\s+/g, " ").trim();
  return desc
    ? `- [${title}](${SITE_URL}${path}): ${desc}`
    : `- [${title}](${SITE_URL}${path})`;
}

export const revalidate = 3600;

export async function GET() {
  const [caseStudies, guides, posts] = await Promise.all([
    fetchTop("caseStudy", "order asc", TOP_CASE_STUDIES),
    fetchTop("guide", "seriesNumber asc, guideNumber asc", TOP_GUIDES),
    fetchTop("post", "publishedAt desc", TOP_POSTS),
  ]);

  const body = [
    "# ECM.DEV",
    "",
    "> Content infrastructure for the AI enterprise. We design the operating systems, governance frameworks, and structured workflows that turn content into a reliable, AI-ready asset.",
    "",
    "ECM.DEV is an independent consultancy working with organisations on Enterprise Content Management, headless CMS platforms, content operations and content localisation. Our three service pillars are Content Technology (platform selection, CMS implementation, integrations), Content Services (governance, migration, editorial operations) and Content Localization (multilingual publishing, translation workflows, in-market content).",
    "",
    section("Core pages", null, [
      link("/", "Home", "Overview of ECM.DEV's positioning, services and case studies."),
      link("/methodology", "Methodology", "How we run engagements: discovery, design, implementation, handover."),
      link("/contact", "Contact", "Start a conversation about a project or engagement."),
    ]),
    section("Services", null, [
      link("/content-technology", "Content Technology", "Headless CMS selection, implementation, integrations and platform strategy."),
      link("/content-services", "Content Services", "Content operations, governance, editorial workflows and migration."),
      link("/content-localization", "Content Localization", "Multilingual content, translation operations and in-market publishing."),
    ]),
    section("Platforms", null, [
      link("/platforms", "Platform library", "Headless CMS platforms and DXP components we implement, with capability notes."),
    ]),
    section("Industries", null, [
      link("/industries", "Industry hubs", "Case studies and perspectives organised by industry."),
    ]),
    section("Assessments", null, [
      link("/assessments", "Diagnostic assessments", "Short structured assessments (CMS implementation readiness, content operations, localization maturity) that produce a scored snapshot and a recommended next step."),
    ]),
    section(
      "Case studies",
      "Anonymised summaries of client engagements across content technology, content services and localization.",
      [
        link("/case-study", "All projects", "Index of every case study."),
        ...caseStudies.map((cs) =>
          link(`/case-study/${cs.slug}`, cs.title, cs.description)
        ),
      ]
    ),
    section(
      "Guides",
      "Long-form editorial guides on ECM strategy, CMS implementation and content operations.",
      [
        link("/guides", "All guides", "Index of every guide series."),
        ...guides.map((g) => link(`/guide/${g.slug}`, g.title, g.description)),
      ]
    ),
    section(
      "Blog",
      "Shorter posts on current thinking, vendor news and practitioner notes.",
      [
        link("/blog", "All posts", "Blog index."),
        ...posts.map((p) => link(`/post/${p.slug}`, p.title, p.description)),
      ]
    ),
    section("Market intelligence", null, [
      link("/intel", "Intel", "Curated market signals across ECM, headless CMS and content operations vendors."),
    ]),
    section("Machine-readable", null, [
      link("/sitemap.xml", "Sitemap", "Full URL inventory for crawlers."),
      link("/robots.txt", "robots.txt", "Crawler access policy."),
    ]),
  ]
    .filter(Boolean)
    .join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
