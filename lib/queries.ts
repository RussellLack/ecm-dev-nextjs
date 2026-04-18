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
      title, slug, client, tags, description, image,
      whoThisIsFor, theChallenge, whatWePropose, whyItMatters, body
    }`,
    { slug }
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
      title, body, publishedAt, mainImage, tags, excerpt,
      seo { metaTitle, metaDescription, ogImage, noIndex }
    }`,
    { slug }
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
