import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProblemPage, getAllProblemSlugs } from "@/lib/queries";
import ProblemPage, { type ProblemPageData } from "@/components/ProblemPage";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllProblemSlugs().catch(() => []);
  return (slugs as { slug: string }[]).slice(0, 50).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = (await getProblemPage(slug).catch(() => null)) as ProblemPageData | null;
  if (!data) return { title: "Problems We Solve | ECM.DEV" };
  const seo = (data as any).seo || {};
  const title = seo.metaTitle || `${data.title} | ECM.DEV`;
  const description =
    seo.metaDescription ||
    data.heroSubhead ||
    "How ECM.DEV helps enterprise marketing teams fix the content infrastructure behind the problem.";
  return {
    title,
    description,
    alternates: { canonical: `/problems/${slug}` },
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: { type: "website", title, description },
  };
}

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = (await getProblemPage(slug).catch(() => null)) as ProblemPageData | null;
  if (!data) notFound();
  return <ProblemPage data={data} />;
}
