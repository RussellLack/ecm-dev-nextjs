import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity.server";
import { tagToSlug } from "@/lib/tags";

const siteUrl = "https://ecm.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages — every public route owned by the app router.
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/content-technology`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/content-services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/content-localization`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/case-study`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/methodology`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/assessments`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/intel`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Blog posts from Sanity
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await sanityFetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
        "slug": slug.current,
        _updatedAt
      }`
    );
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
    guideEntries = guides.map((g) => ({
      url: `${siteUrl}/guide/${g.slug}`,
      lastModified: new Date(g._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch guides", e);
  }

  // Tag archive hub pages — distinct tags across posts and guides.
  let tagEntries: MetadataRoute.Sitemap = [];
  try {
    const [postTags, guideTags] = await Promise.all([
      sanityFetch<string[]>(
        `array::unique(*[_type == "post" && defined(tags)].tags[])`
      ).catch(() => [] as string[]),
      sanityFetch<string[]>(
        `array::unique(*[_type == "guide" && defined(tags)].tags[])`
      ).catch(() => [] as string[]),
    ]);

    const blogTagEntries = (postTags ?? [])
      .filter(Boolean)
      .map((tag) => ({
        url: `${siteUrl}/blog/tag/${tagToSlug(tag)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));

    const guideTagEntries = (guideTags ?? [])
      .filter(Boolean)
      .map((tag) => ({
        url: `${siteUrl}/guides/tag/${tagToSlug(tag)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));

    tagEntries = [...blogTagEntries, ...guideTagEntries];
  } catch (e) {
    console.error("Sitemap: failed to fetch tag list", e);
  }

  return [
    ...staticPages,
    ...blogEntries,
    ...caseStudyEntries,
    ...assessmentEntries,
    ...guideEntries,
    ...tagEntries,
  ];
}
