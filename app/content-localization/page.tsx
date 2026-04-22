import { sanityFetch } from "@/lib/sanity.server";
import { getServicePageQuery } from "@/lib/queries";
import ServicePage from "@/components/ServicePage";
import type { ServicePageData } from "@/lib/serviceTypes";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Content Localisation | ECM.DEV",
  description:
    "We fix the system — not just the translation. Localisation workflow design and source content restructuring for organisations scaling globally.",
};

export default async function ContentLocalizationPage() {
  const data = await sanityFetch<ServicePageData | null>(getServicePageQuery, {
    slug: "content-localization",
  });
  if (!data) return null;
  return <ServicePage data={data} />;
}
