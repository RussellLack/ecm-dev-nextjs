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

// Case studies — index page
export async function getCaseStudies() {
  return client.fetch(`*[_type == "caseStudy"] | order(order asc){
    _id,
    title,
    slug,
    client,
    tags,
    description,
    "imageUrl": image.asset->url
  }`);
}

// Case study — single detail page
export async function getCaseStudy(slug: string) {
  return client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      client,
      tags,
      description,
      whoThisIsFor,
      theChallenge,
      whatWePropose,
      whyItMatters,
      body,
      "imageUrl": image.asset->url
    }`,
    { slug }
  );
}

// Case study slugs — for generateStaticParams
export async function getCaseStudySlugs() {
  return client.fetch(`*[_type == "caseStudy" && defined(slug.current)]{
    "slug": slug.current
  }`);
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

// Ticker tape (homepage marquee)
export async function getTickerTape() {
  return client.fetch(`*[_type == "tickerTape"][0]{
    phrases,
    separator
  }`);
}
