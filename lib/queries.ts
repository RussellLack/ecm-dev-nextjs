import "server-only";
import { sanityFetch } from "./sanity.server";

// Homepage
export async function getHomePage() {
  return sanityFetch(`*[_type == "homePage"][0]{
    heroHeading,
    heroBody,
    symptoms[]{title, description},
    servicesHeading,
    "services": *[_type == "service"] | order(order asc){
      title, slug, category, summary
    },
    learnMoreItems[]{title, subtitle},
    testimonials[]{name, role, quote, commentary},
    ctaHeading,
    ctaSubheading
  }`);
}

// Services
export async function getServices() {
  return sanityFetch(`*[_type == "service"] | order(order asc){
    title, slug, category, summary, body
  }`);
}

// Service packages by category
export async function getServicePackages(category: string) {
  return sanityFetch(
    `*[_type == "servicePackage" && category == $category] | order(order asc){
      title, slug, description, features, cta
    }`,
    { category }
  );
}

// Service hero description by category
export async function getServiceHero(category: string) {
  return sanityFetch<{ heroDescription?: string } | null>(
    `*[_type == "service" && category == $category][0]{heroDescription}`,
    { category }
  );
}

// Case studies
export async function getCaseStudies() {
  return sanityFetch(`*[_type == "caseStudy"] | order(order asc){
    title, slug, client, tags, description, image
  }`);
}

// Single case study
// See getPost re: the markDefs walk for internalLink dereferencing.
export async function getCaseStudy(slug: string) {
  return sanityFetch(
    `*[_type == "caseStudy" && slug.current == $slug][0]{
      title, slug, client, tags, pillars, industry, description, image,
      whoThisIsFor, theChallenge, whatWePropose, whyItMatters,
      body[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "reference": reference->{ _id, _type, "slug": slug.current, title }
          }
        }
      },
      relatedCaseStudies[]->{
        _id, title, slug, client, tags, description, image
      }
    }`,
    { slug }
  );
}

// Related case studies: fallback selector by shared pillar/industry/tags.
// Used by the case-study detail page when relatedCaseStudies is empty.
export async function getRelatedCaseStudies(
  slug: string,
  pillars: string[] = [],
  industry: string | null = null,
  tags: string[] = [],
  limit = 3
) {
  return sanityFetch(
    `*[_type == "caseStudy" && slug.current != $slug && (
        ($industry != null && industry == $industry) ||
        count((pillars[])[@ in $pillars]) > 0 ||
        count((tags[])[@ in $tags]) > 0
      )]
      | order(order asc)[0...$limit]{
      _id, title, slug, client, tags, description, image
    }`,
    { slug, pillars, industry, tags, limit }
  );
}

// All case study slugs (for generateStaticParams)
export async function getAllCaseStudySlugs() {
  return sanityFetch(
    `*[_type == "caseStudy" && defined(slug.current)]{
      "slug": slug.current
    }`
  );
}

// Case studies for a given pillar (drives cluster sections on pillar pages).
export async function getCaseStudiesByPillar(pillar: string, limit = 4) {
  return sanityFetch(
    `*[_type == "caseStudy" && $pillar in pillars[]] | order(order asc)[0...$limit]{
      _id, title, slug, client, tags, description, image, industry
    }`,
    { pillar, limit }
  );
}

// Case studies for a given industry (drives /industries/<slug> hubs).
export async function getCaseStudiesByIndustry(industry: string) {
  return sanityFetch(
    `*[_type == "caseStudy" && industry == $industry] | order(order asc){
      _id, title, slug, client, tags, description, image, industry
    }`,
    { industry }
  );
}

// Distinct list of industries actually used by a case study (for
// /industries listing + generateStaticParams).
export async function getAllUsedIndustries(): Promise<string[]> {
  const industries = await sanityFetch<string[]>(
    `array::unique(*[_type == "caseStudy" && defined(industry)].industry)`
  );
  return (industries ?? []).filter(Boolean);
}

// Blog posts
export async function getBlogPosts(limit = 10) {
  return sanityFetch(
    `*[_type == "post"] | order(publishedAt desc)[0...$limit]{
      title, slug, excerpt, publishedAt, mainImage, tags
    }`,
    { limit }
  );
}

// Single blog post
//
// `body` walks each block and dereferences the `internalLink` markDef so the
// renderer has the target's _type + slug at hand to build a route, without
// needing a second round-trip per link.
export async function getPost(slug: string) {
  return sanityFetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title, publishedAt, _updatedAt, _createdAt, mainImage, tags, pillars, excerpt,
      seo { metaTitle, metaDescription, ogImage, noIndex },
      body[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "reference": reference->{ _id, _type, "slug": slug.current, title }
          }
        }
      },
      relatedPosts[]->{
        _id, title, slug, excerpt, publishedAt, mainImage, tags
      }
    }`,
    { slug }
  );
}

// Related posts: fallback selector by shared tags. Used by the post detail
// page when curated relatedPosts is empty.
export async function getRelatedPostsByTags(
  slug: string,
  tags: string[],
  limit = 3
) {
  if (!tags?.length) return [];
  return sanityFetch(
    `*[_type == "post" && slug.current != $slug && count((tags[])[@ in $tags]) > 0]
      | order(publishedAt desc)[0...$limit]{
      _id, title, slug, excerpt, publishedAt, mainImage, tags
    }`,
    { slug, tags, limit }
  );
}

// Posts filtered by a single tag (for /blog/tag/[tag] archive pages).
// `tagName` (not `tag`) — `tag` is a reserved key on @sanity/client's
// QueryParams interface (former fetch-option guard).
export async function getPostsByTag(tag: string) {
  return sanityFetch(
    `*[_type == "post" && $tagName in tags[]] | order(publishedAt desc){
      _id, title, slug, excerpt, publishedAt, mainImage, tags
    }`,
    { tagName: tag }
  );
}

// Distinct list of tags used by any blog post (for tag archive
// generateStaticParams + slug resolution).
export async function getAllPostTags(): Promise<string[]> {
  const tags = await sanityFetch<string[]>(
    `array::unique(*[_type == "post" && defined(tags)].tags[])`
  );
  return (tags ?? []).filter(Boolean);
}

// Recent posts for a given pillar (drives cluster sections on pillar pages).
export async function getPostsByPillar(pillar: string, limit = 4) {
  return sanityFetch(
    `*[_type == "post" && $pillar in pillars[]] | order(publishedAt desc)[0...$limit]{
      _id, title, slug, excerpt, publishedAt, mainImage, tags
    }`,
    { pillar, limit }
  );
}

// All guides (for /guides page)
export async function getGuides() {
  return sanityFetch(
    `*[_type == "guide"] | order(seriesNumber asc, guideNumber asc) {
      _id, title, subtitle, slug, series, seriesNumber, guideNumber, excerpt, tags, mainImage
    }`
  );
}

// Single guide
// See getPost re: the markDefs walk for internalLink dereferencing.
export async function getGuide(slug: string) {
  return sanityFetch(
    `*[_type == "guide" && slug.current == $slug][0]{
      _id, title, subtitle, slug, series, seriesNumber, guideNumber, excerpt, tags, mainImage,
      _updatedAt, _createdAt, publishedAt,
      seo { metaTitle, metaDescription, ogImage, noIndex },
      body[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "reference": reference->{ _id, _type, "slug": slug.current, title }
          }
        }
      },
      relatedGuides[]->{
        _id, title, subtitle, slug, series, guideNumber, excerpt, tags, mainImage
      }
    }`,
    { slug }
  );
}

// All guide slugs (for generateStaticParams)
export async function getAllGuideSlugs() {
  return sanityFetch(
    `*[_type == "guide"]{ "slug": slug.current }`
  );
}

// Guides filtered by a single tag (for /guides/tag/[tag] archive pages).
// See getPostsByTag re: the `tagName` rename.
export async function getGuidesByTag(tag: string) {
  return sanityFetch(
    `*[_type == "guide" && $tagName in tags[]] | order(seriesNumber asc, guideNumber asc){
      _id, title, subtitle, slug, series, seriesNumber, guideNumber, excerpt, tags, mainImage
    }`,
    { tagName: tag }
  );
}

// Distinct list of tags used by any guide.
export async function getAllGuideTags(): Promise<string[]> {
  const tags = await sanityFetch<string[]>(
    `array::unique(*[_type == "guide" && defined(tags)].tags[])`
  );
  return (tags ?? []).filter(Boolean);
}

// Guides for a given pillar (drives cluster sections on pillar pages).
export async function getGuidesByPillar(pillar: string, limit = 4) {
  return sanityFetch(
    `*[_type == "guide" && $pillar in pillars[]] | order(seriesNumber asc, guideNumber asc)[0...$limit]{
      _id, title, subtitle, slug, series, seriesNumber, guideNumber, excerpt, tags, mainImage
    }`,
    { pillar, limit }
  );
}

// Distinct guide series names with seriesNumber (drives the footer Series
// column and the /guides/series/<slug> hub pages later). Returns one row
// per distinct series.
export async function getDistinctGuideSeries(): Promise<
  Array<{ series: string; seriesNumber: number; count: number }>
> {
  const rows = await sanityFetch<
    Array<{ series: string; seriesNumber: number }>
  >(
    `*[_type == "guide" && defined(series)]{
      series, seriesNumber
    }`
  ).catch(() => [] as Array<{ series: string; seriesNumber: number }>);

  const map = new Map<string, { series: string; seriesNumber: number; count: number }>();
  for (const r of rows ?? []) {
    if (!r.series) continue;
    const existing = map.get(r.series);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(r.series, {
        series: r.series,
        seriesNumber: r.seriesNumber ?? 99,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => a.seriesNumber - b.seriesNumber
  );
}

// Top N tags by usage across published posts. Drives the Topics row in
// the footer. Sorts by usage frequency (descending).
export async function getTopPostTags(
  limit = 8
): Promise<Array<{ tag: string; count: number }>> {
  const allTags = await sanityFetch<string[]>(
    `*[_type == "post" && defined(tags)].tags[]`
  ).catch(() => [] as string[]);

  const counts = new Map<string, number>();
  for (const t of allTags ?? []) {
    if (!t) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}

// ─── Cross-type "one best match" helpers ──────────────────────────────────
//
// These power the MixedRelated component, which surfaces a 1-of-each-type
// recommendation block at the foot of detail pages (a guide on a post,
// a case study on a guide, etc.). Cross-type recommendations beat
// same-type lists for crawl breadth and topical authority.
//
// The match logic prefers tag overlap (more specific) over pillar match
// (broader) and returns the most recently published item that qualifies.
// Returns null when nothing matches so the renderer can omit the slot.

type CrossLinkArgs = {
  excludeSlug?: string;
  pillars?: string[];
  tags?: string[];
};

export async function getOneRelatedGuide({
  excludeSlug = "",
  pillars = [],
  tags = [],
}: CrossLinkArgs) {
  if (!pillars.length && !tags.length) return null;
  return sanityFetch<any>(
    `*[_type == "guide" && slug.current != $excludeSlug && (
        count((tags[])[@ in $tags]) > 0 ||
        count((pillars[])[@ in $pillars]) > 0
      )]
      | order(count((tags[])[@ in $tags]) desc, seriesNumber asc, guideNumber asc)[0]{
        _id, title, subtitle, slug, series, guideNumber, excerpt, mainImage
      }`,
    { excludeSlug, pillars, tags }
  );
}

export async function getOneRelatedCaseStudy({
  excludeSlug = "",
  pillars = [],
  tags = [],
}: CrossLinkArgs) {
  if (!pillars.length && !tags.length) return null;
  return sanityFetch<any>(
    `*[_type == "caseStudy" && slug.current != $excludeSlug && (
        count((pillars[])[@ in $pillars]) > 0 ||
        count((tags[])[@ in $tags]) > 0
      )]
      | order(count((pillars[])[@ in $pillars]) desc, order asc)[0]{
        _id, title, slug, client, description, image
      }`,
    { excludeSlug, pillars, tags }
  );
}

export async function getOneRelatedPost({
  excludeSlug = "",
  pillars = [],
  tags = [],
}: CrossLinkArgs) {
  if (!pillars.length && !tags.length) return null;
  return sanityFetch<any>(
    `*[_type == "post" && slug.current != $excludeSlug && (
        count((tags[])[@ in $tags]) > 0 ||
        count((pillars[])[@ in $pillars]) > 0
      )]
      | order(count((tags[])[@ in $tags]) desc, publishedAt desc)[0]{
        _id, title, slug, excerpt, publishedAt, mainImage
      }`,
    { excludeSlug, pillars, tags }
  );
}

export async function getOneRelatedAssessment({
  pillars = [],
}: Pick<CrossLinkArgs, "pillars">) {
  if (!pillars.length) return null;
  return sanityFetch<any>(
    `*[_type == "assessment" && defined(slug.current) && count((pillars[])[@ in $pillars]) > 0]
      | order(_createdAt desc)[0]{
        _id, title, slug, subtitle, introText
      }`,
    { pillars }
  );
}

// ─── Platforms (editorial vendor pages at /platforms/<slug>) ──────────────

export async function getPlatforms() {
  return sanityFetch(
    `*[_type == "platform" && defined(slug.current)] | order(order asc, name asc){
      _id, name, slug, category, summary, logo
    }`
  );
}

export async function getAllPlatformSlugs() {
  return sanityFetch(
    `*[_type == "platform" && defined(slug.current)]{ "slug": slug.current }`
  );
}

export async function getPlatform(slug: string) {
  return sanityFetch(
    `*[_type == "platform" && slug.current == $slug][0]{
      _id, name, slug, category, summary, heroDescription, logo,
      pillars, tagAliases, intelVendorSlug, website,
      body[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "reference": reference->{ _id, _type, "slug": slug.current, title }
          }
        }
      },
      seo { metaTitle, metaDescription, ogImage, noIndex }
    }`,
    { slug }
  );
}

// Content tagged with any of a platform's tag aliases. Powers the auto-
// populated cluster on the platform detail page so editors aren't on
// the hook for hand-curating it.
export async function getContentForPlatform(tagAliases: string[]) {
  if (!tagAliases?.length) {
    return { posts: [], guides: [], caseStudies: [] };
  }
  const [posts, guides, caseStudies] = await Promise.all([
    sanityFetch<any[]>(
      `*[_type == "post" && count((tags[])[@ in $aliases]) > 0]
        | order(publishedAt desc)[0...6]{
        _id, title, slug, excerpt, publishedAt, mainImage
      }`,
      { aliases: tagAliases }
    ).catch(() => []),
    sanityFetch<any[]>(
      `*[_type == "guide" && count((tags[])[@ in $aliases]) > 0]
        | order(seriesNumber asc, guideNumber asc)[0...4]{
        _id, title, subtitle, slug, series, guideNumber, excerpt, mainImage
      }`,
      { aliases: tagAliases }
    ).catch(() => []),
    sanityFetch<any[]>(
      `*[_type == "caseStudy" && count((tags[])[@ in $aliases]) > 0]
        | order(order asc)[0...4]{
        _id, title, slug, client, description, image
      }`,
      { aliases: tagAliases }
    ).catch(() => []),
  ]);
  return { posts, guides, caseStudies };
}
