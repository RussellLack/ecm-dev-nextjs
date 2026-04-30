import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActiveIntelVendors,
  getIntelArticlesByVendor,
  getIntelVendorBySlug,
} from "@/lib/intel/queries";
import IntelArticleList from "../../IntelArticleList";

export const revalidate = 300;

export async function generateStaticParams() {
  const vendors = await getActiveIntelVendors().catch(() => []);
  return (vendors ?? []).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getIntelVendorBySlug(slug).catch(() => null);
  if (!vendor) return { title: "Vendor not found" };

  const title = `${vendor.name} — Intel`;
  const description = `Curated industry signal on ${vendor.name}${
    vendor.category ? ` (${vendor.category})` : ""
  }: AI-enriched briefings on platform updates, partnerships, and product direction.`;
  return {
    title,
    description,
    alternates: { canonical: `/intel/vendor/${slug}` },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function IntelVendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [vendor, articles] = await Promise.all([
    getIntelVendorBySlug(slug).catch(() => null),
    getIntelArticlesByVendor(slug).catch(() => []),
  ]);
  if (!vendor) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
          <li>
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/intel"
              className="hover:text-neutral-900 transition-colors"
            >
              Intel
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>Vendor</li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-neutral-900">
            {vendor.name}
          </li>
        </ol>
      </nav>

      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
          Vendor{vendor.category ? ` · ${vendor.category}` : ""}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">{vendor.name}</h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          {articles.length} curated{" "}
          {articles.length === 1 ? "briefing" : "briefings"} mentioning{" "}
          {vendor.name}.
        </p>
        {vendor.website && (
          <p className="mt-2 text-sm">
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-700 underline hover:text-neutral-900 transition-colors"
            >
              {vendor.name} website ↗
            </a>
          </p>
        )}
      </header>

      <IntelArticleList articles={articles} />

      <div className="mt-12">
        <Link
          href="/intel"
          className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          ← All intel
        </Link>
      </div>
    </main>
  );
}
