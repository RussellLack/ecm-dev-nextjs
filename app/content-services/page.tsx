import ServicePageLayout from "@/components/ServicePageLayout";
import { getServicePackages, getServiceHero } from "@/lib/queries";

export const revalidate = 60;

// Static fallback in case Sanity isn't connected yet
const fallbackPackages = [
  { title: "Train Your Teams on What \u201CGood Content\u201D Looks Like", description: "We create and deliver a set of short, practical training modules that show your teams how to plan, review, and use content more effectively \u2014 tailored to their specific roles." },
  { title: "Improve Internal Buy-In for Your Content Work", description: "We help you showcase the business value of your content through data-backed reports, simple visuals, and messaging that resonates with leadership." },
  { title: "Build a Smarter Content Calendar", description: "We design a structured content calendar that aligns your publishing cadence with business goals, audience behaviour, and seasonal opportunities." },
  { title: "Audit & Fix Your Content Workflow", description: "We review your end-to-end content workflow, identify bottlenecks and inefficiencies, and deliver a redesigned process with clear ownership and faster turnaround." },
  { title: "Create a Content Governance Framework", description: "We build a practical governance framework covering roles, approvals, quality standards, and lifecycle management to reduce risk and improve consistency." },
  { title: "Measure What Your Content Actually Delivers", description: "We set up reporting dashboards and KPIs that connect content activity to business outcomes \u2014 so you know what\u2019s working and what to cut." },
];

export default async function ContentServicesPage() {
  let packages;
  try {
    packages = await getServicePackages("services");
    if (!packages || packages.length === 0) packages = fallbackPackages;
  } catch {
    packages = fallbackPackages;
  }

  const service = await getServiceHero("services").catch(() => null);

  return (
    <ServicePageLayout
      title="CONTENT SERVICES"
      heroDescription={service?.heroDescription || "Designing effective content strategies, optimizing content workflows, and improving overall content performance. We can also train employees with the skills and knowledge to build a content marketing engine to support business growth strategies."}
      packages={packages}
    />
  );
}
