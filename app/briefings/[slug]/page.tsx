import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCornerstone, getAllCornerstoneSlugs } from "@/lib/queries";
import Cornerstone, { type CornerstoneData } from "@/components/Cornerstone";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllCornerstoneSlugs().catch(() => []);
  return (slugs as { slug: string }[]).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = (await getCornerstone(slug).catch(() => null)) as CornerstoneData | null;
  if (!data) return { title: "Executive Briefings | ECM.DEV" };
  const seo = (data as any).seo || {};
  const title = seo.metaTitle || `${data.title} | ECM.DEV`;
  const description =
    seo.metaDescription ||
    data.standfirst ||
    "A board-level briefing on the content infrastructure behind modern marketing.";
  return {
    title,
    description,
    alternates: { canonical: `/briefings/${slug}` },
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: { type: "article", title, description },
  };
}

export default async function CornerstoneDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = (await getCornerstone(slug).catch(() => null)) as CornerstoneData | null;
  if (!data) notFound();
  return <Cornerstone data={data} />;
}
