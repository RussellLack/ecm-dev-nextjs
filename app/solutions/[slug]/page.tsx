import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSolutionPage, getAllSolutionSlugs } from "@/lib/queries";
import SolutionPage, { type SolutionPageData } from "@/components/SolutionPage";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllSolutionSlugs().catch(() => []);
  return (slugs as { slug: string }[]).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = (await getSolutionPage(slug).catch(() => null)) as SolutionPageData | null;
  if (!data) return { title: "Solutions | ECM.DEV" };
  const seo = (data as any).seo || {};
  const title = seo.metaTitle || `${data.title} | ECM.DEV`;
  const description =
    seo.metaDescription ||
    data.heroSubhead ||
    "How ECM.DEV builds the content infrastructure behind this marketing outcome.";
  return {
    title,
    description,
    alternates: { canonical: `/solutions/${slug}` },
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: { type: "website", title, description },
  };
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = (await getSolutionPage(slug).catch(() => null)) as SolutionPageData | null;
  if (!data) notFound();
  return <SolutionPage data={data} />;
}
