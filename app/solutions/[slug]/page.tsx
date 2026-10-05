import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSolutionPage, getAllSolutionSlugs } from "@/lib/queries";
import SolutionPage, { type SolutionPageData } from "@/components/SolutionPage";
import WorkflowSolutionPage from "@/components/WorkflowSolutionPage";
import {
  WORKFLOW_SOLUTION_SLUGS,
  getWorkflowSolution,
} from "@/lib/workflowSolutions";

export const revalidate = 3600;

/* Two kinds of page share this route. The workflow-led buyer-situation
   pages (lib/workflowSolutions.ts) are code records and are checked first,
   with no Sanity call. Every other slug is an outcome-led `solutionPage`
   from Sanity, unchanged. The two slug sets do not overlap. */

export async function generateStaticParams() {
  const slugs = await getAllSolutionSlugs().catch(() => []);
  const sanitySlugs = (slugs as { slug: string }[])
    .slice(0, 50)
    .map((s) => s.slug)
    .filter((s) => !WORKFLOW_SOLUTION_SLUGS.includes(s as never));
  return [...WORKFLOW_SOLUTION_SLUGS, ...sanitySlugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const workflow = getWorkflowSolution(slug);
  if (workflow) {
    return {
      title: workflow.metaTitle,
      description: workflow.metaDescription,
      alternates: { canonical: `/solutions/${slug}` },
      openGraph: {
        type: "website",
        title: workflow.metaTitle,
        description: workflow.metaDescription,
      },
    };
  }

  const data = (await getSolutionPage(slug).catch(() => null)) as SolutionPageData | null;
  if (!data) return { title: "Solutions" };
  const seo = (data as any).seo || {};
  const title = seo.metaTitle || `${data.title} | ECM.DEV`;
  const description =
    seo.metaDescription ||
    data.heroSubhead ||
    "How ECM.DEV builds the content infrastructure behind this marketing outcome.";
  return {
    // `absolute`, as in lib/pillarMetadata.ts: the fallback above already
    // ends in "| ECM.DEV", and editor metaTitles follow that convention, so
    // the root layout's `%s | ECM.DEV` template must not apply again.
    title: { absolute: title },
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

  const workflow = getWorkflowSolution(slug);
  if (workflow) return <WorkflowSolutionPage data={workflow} />;

  const data = (await getSolutionPage(slug).catch(() => null)) as SolutionPageData | null;
  if (!data) notFound();
  return <SolutionPage data={data} />;
}
