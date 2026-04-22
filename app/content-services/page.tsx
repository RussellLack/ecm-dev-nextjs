import { sanityFetch } from "@/lib/sanity.server";
import { getServicePageQuery } from "@/lib/queries";
import ServicePage from "@/components/ServicePage";
import type { ServicePageData } from "@/lib/serviceTypes";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Content Services | ECM.DEV",
  description:
    "Governance, workflow, and measurement — designed so content scales without hiring.",
};

export default async function ContentServicesPage() {
  const data = await sanityFetch<ServicePageData | null>(getServicePageQuery, {
    slug: "content-services",
  });
  if (!data) return null;
  return <ServicePage data={data} />;
}
