import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RepresentativeEngagementPage from "@/components/proof/RepresentativeEngagementPage";
import {
  REPRESENTATIVE_ENGAGEMENTS,
  ENGAGEMENTS_PATH,
  getEngagement,
} from "@/lib/representativeEngagements";

/* Static pages from code records (lib/representativeEngagements.ts): no
   Sanity call. Structured data is the BreadcrumbList from <Breadcrumbs>
   only; no Article/Review/Organization schema, so a scenario is never
   represented as a named client engagement or testimonial. */

export const dynamicParams = false;

export function generateStaticParams() {
  return REPRESENTATIVE_ENGAGEMENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = getEngagement(slug);
  if (!e || e.slug !== slug) return { title: "Representative engagements" };
  const path = `${ENGAGEMENTS_PATH}/${e.slug}`;
  return {
    title: e.metaTitle,
    description: e.metaDescription,
    alternates: { canonical: path },
    openGraph: { type: "article", title: e.metaTitle, description: e.metaDescription },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEngagement(slug);
  if (!e || e.slug !== slug) notFound();
  return <RepresentativeEngagementPage data={e} />;
}
