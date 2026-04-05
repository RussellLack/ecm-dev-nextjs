import type { MetadataRoute } from "next";
import { client } from "@/lib/sanity";

const siteUrl = "https://ecm.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/work`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/assessments`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Blog posts from Sanity
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await client.fetch<
      { slug: string; _updatedAt: string }[]
    >(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
      "slug": slug.current,
      _updatedAt
    }`);
    blogEntries = posts.map((post) => ({
      url: `${siteUrl}/post/${post.slug}`,
      lastModified: new Date(post._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch blog posts", e);
  }

  // Assessments from Sanity
  let assessmentEntries: MetadataRoute.Sitemap = [];
  try {
    const assessments = await client.fetch<
      { slug: string; _updatedAt: string }[]
    >(`*[_type == "assessment" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }`);
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
    const guides = await client.fetch<
      { slug: string; _updatedAt: string }[]
    >(`*[_type == "guide" && defined(slug.current)] | order(seriesNumber asc, guideNumber asc) {
      "slug": slug.current,
      _updatedAt
    }`);
    guideEntries = guides.map((g) => ({
      url: `${siteUrl}/guide/${g.slug}`,
      lastModified: new Date(g._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch guides", e);
  }

  return [...staticPages, ...blogEntries, ...assessmentEntries, ...guideEntries];
}
