/**
 * Schema.org JSON-LD builders.
 *
 * Each function returns a plain object that the JsonLd component
 * stringifies and injects as a nonce'd <script type="application/ld+json">.
 *
 * Keep these PURE — no I/O, no React. Pages / queries fetch the source
 * data, builders just shape it.
 */

import { urlFor } from "@/lib/sanity";

const SITE_URL = "https://ecm.dev";
const SITE_NAME = "ECM.DEV";
const SITE_DESCRIPTION =
  "We design the operating systems, governance frameworks, and structured workflows that turn content into a reliable, AI-ready asset.";
const CONTACT_EMAIL = "rl@ecm.dev";

const ORG_REF = {
  "@type": "Organization" as const,
  name: SITE_NAME,
  url: SITE_URL,
};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT_EMAIL,
      contactType: "customer support",
    },
  };
}

type SanityImage = {
  asset?: { _ref?: string; _type?: string };
  alt?: string;
} | undefined;

type ArticleInput = {
  title: string;
  excerpt?: string;
  publishedAt?: string;
  _createdAt?: string;
  _updatedAt: string;
  mainImage?: SanityImage;
};

/**
 * Article schema for blog posts and long-form guides.
 *
 * `pathPrefix` is the URL segment ("post" or "guide") so we can construct
 * the canonical mainEntityOfPage @id without the page having to pass us a
 * fully-qualified URL.
 */
export function articleSchema(
  doc: ArticleInput,
  slug: string,
  pathPrefix: "post" | "guide"
) {
  const url = `${SITE_URL}/${pathPrefix}/${slug}`;
  const datePublished = doc.publishedAt ?? doc._createdAt;
  const dateModified = doc._updatedAt;
  const imageUrl = doc.mainImage
    ? urlFor(doc.mainImage).width(1200).height(630).url()
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: doc.title,
    ...(doc.excerpt ? { description: doc.excerpt } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(datePublished ? { datePublished } : {}),
    dateModified,
    author: ORG_REF,
    publisher: ORG_REF,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };
}

type ServiceInput = {
  name: string;
  description: string;
  path: string; // e.g. "/content-localization"
  serviceType: string;
};

export function serviceSchema(input: ServiceInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    serviceType: input.serviceType,
    areaServed: "Worldwide",
    provider: ORG_REF,
  };
}

export type BreadcrumbItem = {
  name: string;
  // Path beginning with "/" or null for the current page (no link).
  path: string | null;
};

/**
 * BreadcrumbList JSON-LD. Pass an ordered list of crumbs ending with the
 * current page; the current page typically has path: null and is rendered
 * as un-linked text, but Google still expects it in the structured data.
 */
export function breadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${SITE_URL}${item.path}` } : {}),
    })),
  };
}
