import type { Metadata } from "next";
import { getServiceHero } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";

/**
 * Shared metadata builder for the three pillar landing pages
 * (/content-services, /content-technology, /content-localization).
 * Resolves the editor-managed `seo` object first, falls back to the
 * service hero content from Sanity, then to a static safety net.
 */
export async function buildPillarMetadata(opts: {
  category: "services" | "technology" | "localization";
  fallbackTitle: string;
  fallbackDescription: string;
  canonical: string;
}): Promise<Metadata> {
  const service = await getServiceHero(opts.category).catch(() => null);
  const seo = service?.seo || {};

  const title =
    seo.metaTitle || `${opts.fallbackTitle} | ECM.DEV`;

  const heroBlurb = service?.heroDescription
    ? String(service.heroDescription).split(/\n+/)[0].slice(0, 155).trim()
    : null;
  const description = seo.metaDescription || heroBlurb || opts.fallbackDescription;

  // OG image precedence: editor seo override → service.image → no image.
  const ogSource = seo.ogImage || service?.image;
  const ogImage = ogSource
    ? urlFor(ogSource).width(1200).height(630).fit("crop").crop("center").url()
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: opts.canonical },
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
