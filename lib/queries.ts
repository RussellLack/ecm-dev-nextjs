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
export async function getCaseStudy(slug: string) {
  return sanityFetch(
    `*[_type == "caseStudy" && slug.current == $slug][0]{
      title, slug, client, tags, pillars, industry, description, image,
      whoThisIsFor, theChallenge, whatWePropose, whyItMatters, body,
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
export async function getPost(slug: string) {
  return sanityFetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title, body, publishedAt, _updatedAt, _createdAt, mainImage, tags, pillars, excerpt,
      seo { metaTitle, metaDescription, ogImage, noIndex },
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
export async function getGuide(slug: string) {
  return sanityFetch(
    `*[_type == "guide" && slug.current == $slug][0]{
      _id, title, subtitle, slug, series, seriesNumber, guideNumber, excerpt, tags, mainImage, body,
      _updatedAt, _createdAt, publishedAt,
      seo { metaTitle, metaDescription, ogImage, noIndex },
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
