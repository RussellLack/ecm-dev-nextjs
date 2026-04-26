import { sanityFetch } from "@/lib/sanity.server";
import { getServicePageQuery } from "@/lib/queries";
import ServicePage from "@/components/ServicePage";
import type { ServicePageData } from "@/lib/serviceTypes";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Content Technology | ECM.DEV",
  description:
    "We fix the operational layer that determines whether your CMS, DAM, and AI investments perform.",
};

export default async function ContentTechnologyPage() {
  const data = await sanityFetch<ServicePageData | null>(getServicePageQuery, {
    slug: "content-technology",
  });
  if (!data) return null;
  return <ServicePage data={data} />;
}
