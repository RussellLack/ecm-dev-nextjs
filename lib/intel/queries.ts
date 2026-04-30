import "server-only";
import { sanityIntelFetch } from "./sanity";

export type IntelHubArticle = {
  id: string;
  title: string;
  url: string;
  source: { title: string; url: string | null } | null;
  publishedDate: string | null;
  summary: string | null;
  keyInsight: string | null;
  topics: { title: string; slug: string }[];
  vendors: { name: string; slug: string | null }[];
  contentAngle: string | null;
};

const ARTICLE_PROJECTION = `{
  "id": _id,
  title,
  url,
  "source": source->{ "title": title, "url": homepageUrl },
  "publishedDate": publishedDate,
  summary,
  "keyInsight": keyInsight,
  "topics": topics[]->{ "title": title, "slug": slug.current },
  "vendors": vendors[]->{ "name": name, "slug": slug.current },
  "contentAngle": contentAngle
}`;

// All published intel articles (for the main /intel page).
export async function getPublishedIntelArticles(limit = 100) {
  return sanityIntelFetch<IntelHubArticle[]>(
    `*[_type == "intelArticle" && status == "published"]
      | order(publishedDate desc) [0...$limit] ${ARTICLE_PROJECTION}`,
    { limit }
  );
}

// Topics that have at least one published article (powers /intel/topic/[slug]
// generateStaticParams and the topic chip list on /intel).
export async function getActiveIntelTopics() {
  return sanityIntelFetch<{ title: string; slug: string }[]>(
    `*[_type == "intelTopic" && count(*[_type == "intelArticle" && status == "published" && references(^._id)]) > 0]
      | order(title asc) {
      "title": title,
      "slug": slug.current
    }`
  );
}

export async function getIntelTopicBySlug(slug: string) {
  return sanityIntelFetch<{ title: string; slug: string } | null>(
    `*[_type == "intelTopic" && slug.current == $slug][0]{
      "title": title,
      "slug": slug.current
    }`,
    { slug }
  );
}

export async function getIntelArticlesByTopic(slug: string, limit = 100) {
  return sanityIntelFetch<IntelHubArticle[]>(
    `*[_type == "intelArticle" && status == "published" && $slug in topics[]->slug.current]
      | order(publishedDate desc) [0...$limit] ${ARTICLE_PROJECTION}`,
    { slug, limit }
  );
}

// Vendors that have at least one published article.
export async function getActiveIntelVendors() {
  return sanityIntelFetch<{ name: string; slug: string; category: string | null }[]>(
    `*[_type == "intelVendor" && count(*[_type == "intelArticle" && status == "published" && references(^._id)]) > 0]
      | order(name asc) {
      "name": name,
      "slug": slug.current,
      category
    }`
  );
}

export async function getIntelVendorBySlug(slug: string) {
  return sanityIntelFetch<{ name: string; slug: string; category: string | null; website: string | null } | null>(
    `*[_type == "intelVendor" && slug.current == $slug][0]{
      "name": name,
      "slug": slug.current,
      category,
      website
    }`,
    { slug }
  );
}

export async function getIntelArticlesByVendor(slug: string, limit = 100) {
  return sanityIntelFetch<IntelHubArticle[]>(
    `*[_type == "intelArticle" && status == "published" && $slug in vendors[]->slug.current]
      | order(publishedDate desc) [0...$limit] ${ARTICLE_PROJECTION}`,
    { slug, limit }
  );
}
