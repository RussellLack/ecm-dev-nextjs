import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity.server";
import {
  getActiveIntelTopics,
  getActiveIntelVendors,
} from "@/lib/intel/queries";
import { tagToSlug } from "@/lib/tags";

const siteUrl = "https://ecm.dev";

// Stable fallback for pages whose freshness isn't tied to a single Sanity
// document (marketing/legal pages, hubs with no dated source). A FIXED date —
// never `new Date()` — so the value doesn't churn on every deploy. Google
// learns to ignore a `lastmod` that changes on every crawl, which suppresses
// crawl priority. Bump this when the static pages are meaningfully edited.
const STATIC_LAST_MODIFIED = new Date("2026-06-01T00:00:00.000Z");

// Largest `_updatedAt` across a set of Sanity docs, or a stable fallback.
// Used to give listing/archive/hub pages a freshness date that only moves
// when their underlying content actually changes.
function latestMod(
  docs: { _updatedAt?: string }[],
  fallback: Date = STATIC_LAST_MODIFIED,
): Date {
  const times = docs
    .map((d) => (d._updatedAt ? new Date(d._updatedAt).getTime() : NaN))
    .filter((t) => !Number.isNaN(t));
  return times.length ? new Date(Math.max(...times)) : fallback;
}

function maxDate(...dates: Date[]): Date {
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Per-content-type freshness, derived from each type's newest `_updatedAt`.
  // Initialised to the stable fallback so a failed fetch never produces a
  // churning "now" date.
  let postsMax = STATIC_LAST_MODIFIED;
  let caseStudiesMax = STATIC_LAST_MODIFIED;
  let assessmentsMax = STATIC_LAST_MODIFIED;
  let guidesMax = STATIC_LAST_MODIFIED;
  let guideSeriesMax = STATIC_LAST_MODIFIED;
  let platformsMax = STATIC_LAST_MODIFIED;

  // Blog posts from Sanity
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await sanityFetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
        "slug": slug.current,
        _updatedAt
      }`
    );
    postsMax = latestMod(posts);
    blogEntries = posts.map((post) => ({
      url: `${siteUrl}/post/${post.slug}`,
      lastModified: new Date(post._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch blog posts", e);
  }

  // Case studies from Sanity
  let caseStudyEntries: MetadataRoute.Sitemap = [];
  try {
    const caseStudies = await sanityFetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "caseStudy" && defined(slug.current)] | order(order asc) {
        "slug": slug.current,
        _updatedAt
      }`
    );
    caseStudiesMax = latestMod(caseStudies);
    caseStudyEntries = caseStudies.map((cs) => ({
      url: `${siteUrl}/case-study/${cs.slug}`,
      lastModified: new Date(cs._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch case studies", e);
  }

  // Assessments from Sanity
  let assessmentEntries: MetadataRoute.Sitemap = [];
  try {
    const assessments = await sanityFetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "assessment" && defined(slug.current)] {
        "slug": slug.current,
        _updatedAt
      }`
    );
    assessmentsMax = latestMod(assessments);
    assessmentEntries = assessments.map((a) => ({
      url: `${siteUrl}/assessment/${a.slug}`,
      lastModified: new Date(a._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch assessments", e);
  }

  // Guides from Sanity
  let guideEntries: MetadataRoute.Sitemap = [];
  try {
    const guides = await sanityFetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "guide" && defined(slug.current)] | order(seriesNumber asc, guideNumber asc) {
        "slug": slug.current,
        _updatedAt
      }`
    );
    guidesMax = latestMod(guides);
    guideEntries = guides.map((g) => ({
      url: `${siteUrl}/guide/${g.slug}`,
      lastModified: new Date(g._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch guides", e);
  }

  // Guide series hub pages — editorial entry points into each theme.
  // Priority above individual guides (0.7) but below top-level service
  // pages (0.9): set to 0.8.
  let guideSeriesEntries: MetadataRoute.Sitemap = [];
  try {
    const seriesDocs = await sanityFetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "guideSeries" && defined(slug.current)] | order(order asc) {
        "slug": slug.current,
        _updatedAt
      }`
    );
    guideSeriesMax = latestMod(seriesDocs);
    guideSeriesEntries = seriesDocs.map((s) => ({
      url: `${siteUrl}/guides/${s.slug}`,
      lastModified: new Date(s._updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch guide series", e);
  }

  // Tag archive hub pages — distinct tags across posts and guides.
  //
  // Only tags applied to MIN_TAGGED_ITEMS+ items are listed. Single-item tag
  // archives are thin, near-duplicate pages (a tag page wrapping one post is
  // just a worse version of the post) that dilute crawl budget without
  // ranking — they were the bulk of the sitemap and a likely cause of the
  // "Discovered - currently not indexed" pile in Search Console. We count by
  // SLUG (not raw tag) because that's what the /tag/[slug] archive groups on.
  // A tag archive's freshness tracks the newest item of its parent type.
  const MIN_TAGGED_ITEMS = 2;
  let tagEntries: MetadataRoute.Sitemap = [];
  try {
    const [postTags, guideTags] = await Promise.all([
      sanityFetch<string[]>(
        // Post tags now live in topics + vendors; fall back to legacy
        // tags for any un-migrated doc. Matches lib/queries.ts POST_TAGS.
        `*[_type == "post"]{
          "t": select(
            count(coalesce(topics, []) + coalesce(vendors, [])) > 0
            => coalesce(topics, []) + coalesce(vendors, []),
            coalesce(tags, [])
          )
        }.t[]`
      ).catch(() => [] as string[]),
      sanityFetch<string[]>(
        `*[_type == "guide" && defined(tags)].tags[]`
      ).catch(() => [] as string[]),
    ]);

    // Slugs applied to at least `min` items, counted by archive slug.
    const slugsWithMinItems = (tags: string[], min: number): string[] => {
      const counts = new Map<string, number>();
      for (const tag of tags) {
        if (!tag) continue;
        const slug = tagToSlug(tag);
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      }
      return [...counts.entries()]
        .filter(([, n]) => n >= min)
        .map(([slug]) => slug);
    };

    const blogTagEntries = slugsWithMinItems(postTags ?? [], MIN_TAGGED_ITEMS)
      .map((slug) => ({
        url: `${siteUrl}/blog/tag/${slug}`,
        lastModified: postsMax,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));

    const guideTagEntries = slugsWithMinItems(guideTags ?? [], MIN_TAGGED_ITEMS)
      .map((slug) => ({
        url: `${siteUrl}/guides/tag/${slug}`,
        lastModified: guidesMax,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));

    tagEntries = [...blogTagEntries, ...guideTagEntries];
  } catch (e) {
    console.error("Sitemap: failed to fetch tag list", e);
  }

  // Industry hub pages — one per distinct industry actually in use.
  // Derived from case studies, so they share the case-study freshness date.
  let industryEntries: MetadataRoute.Sitemap = [];
  try {
    const industries = await sanityFetch<string[]>(
      `array::unique(*[_type == "caseStudy" && defined(industry)].industry)`
    ).catch(() => [] as string[]);
    industryEntries = (industries ?? [])
      .filter(Boolean)
      .map((slug) => ({
        url: `${siteUrl}/industries/${slug}`,
        lastModified: caseStudiesMax,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
  } catch (e) {
    console.error("Sitemap: failed to fetch industries", e);
  }

  // Intel topic + vendor hubs (only those with at least one published article).
  // The active-hub helpers don't expose per-hub dates, so use the stable
  // fallback rather than a churning `new Date()`.
  let intelHubEntries: MetadataRoute.Sitemap = [];
  try {
    const [topics, vendors] = await Promise.all([
      getActiveIntelTopics().catch(() => []),
      getActiveIntelVendors().catch(() => []),
    ]);
    intelHubEntries = [
      ...(topics ?? []).map((t) => ({
        url: `${siteUrl}/intel/topic/${t.slug}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...(vendors ?? []).map((v) => ({
        url: `${siteUrl}/intel/vendor/${v.slug}`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch (e) {
    console.error("Sitemap: failed to fetch intel hubs", e);
  }

  // Platform detail pages.
  let platformEntries: MetadataRoute.Sitemap = [];
  try {
    const platforms = await sanityFetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "platform" && defined(slug.current)] | order(name asc) {
        "slug": slug.current,
        _updatedAt
      }`
    );
    platformsMax = latestMod(platforms);
    platformEntries = platforms.map((p) => ({
      url: `${siteUrl}/platforms/${p.slug}`,
      lastModified: new Date(p._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch platforms", e);
  }

  // Newest content anywhere on the site — the homepage surfaces latest items,
  // so its freshness tracks the most recent content update.
  const siteLatest = maxDate(
    postsMax,
    caseStudiesMax,
    assessmentsMax,
    guidesMax,
    guideSeriesMax,
    platformsMax,
  );

  // Static pages — every public route owned by the app router.
  // Listing pages take their parent content type's freshness; genuinely
  // static marketing/legal pages take the stable fixed date. None use
  // `new Date()`, so deploys no longer reset every `lastmod` to "now".
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: siteLatest, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/content-technology`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/content-services`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/content-localization`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/case-study`, lastModified: caseStudiesMax, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/methodology`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/assessments`, lastModified: assessmentsMax, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: postsMax, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/guides`, lastModified: maxDate(guidesMax, guideSeriesMax), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/intel`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/industries`, lastModified: caseStudiesMax, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/platforms`, lastModified: platformsMax, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...blogEntries,
    ...caseStudyEntries,
    ...assessmentEntries,
    ...guideSeriesEntries,
    ...guideEntries,
    ...tagEntries,
    ...industryEntries,
    ...intelHubEntries,
    ...platformEntries,
  ];
}
