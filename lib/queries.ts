import { client } from "./sanity";

// Homepage
export async function getHomePage() {
  return client.fetch(`*[_type == "homePage"][0]{
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
  return client.fetch(`*[_type == "service"] | order(order asc){
    title, slug, category, summary, body
  }`);
}

// Service packages by category
export async function getServicePackages(category: string) {
  return client.fetch(
    `*[_type == "servicePackage" && category == $category] | order(order asc){
      title, slug, description, features, cta
    }`,
    { category }
  );
}

// Case studies
export async function getCaseStudies() {
  return client.fetch(`*[_type == "caseStudy"] | order(order asc){
    title, slug, client, tags, description, image
  }`);
}

// Single case study
export async function getCaseStudy(slug: string) {
  return client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug][0]{
      title, slug, client, tags, description, image
    }`,
    { slug }
  );
}

// All case study slugs (for generateStaticParams)
export async function getAllCaseStudySlugs() {
  return client.fetch(
    `*[_type == "caseStudy" && defined(slug.current)]{
      "slug": slug.current
    }`
  );
}

// Blog posts
export async function getBlogPosts(limit = 10) {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc)[0...$limit]{
      title, slug, excerpt, publishedAt, mainImage, tags
    }`,
    { limit }
  );
}

// Single blog post
export async function getPost(slug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title, body, publishedAt, mainImage, tags
    }`,
    { slug }
  );
}

// All guides (for /guides page)
export async function getGuides() {
  return client.fetch(
    `*[_type == "guide"] | order(seriesNumber asc, guideNumber asc) {
      _id, title, subtitle, slug, series, seriesNumber, guideNumber, excerpt, tags, mainImage
    }`
  );
}

// Single guide
export async function getGuide(slug: string) {
  return client.fetch(
    `*[_type == "guide" && slug.current == $slug][0]{
      _id, title, subtitle, slug, series, seriesNumber, guideNumber, excerpt, tags, mainImage, body,
      relatedGuides[]->{
        _id, title, subtitle, slug, series, guideNumber, excerpt, tags, mainImage
      }
    }`,
    { slug }
  );
}

// All guide slugs (for generateStaticParams)
export async function getAllGuideSlugs() {
  return client.fetch(
    `*[_type == "guide"]{ "slug": slug.current }`
  );
}
