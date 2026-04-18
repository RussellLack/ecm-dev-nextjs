import ServicePageLayout from "@/components/ServicePageLayout";

const packages = [
  {
    title: "Build a Better Navigation & Site Structure",
    description:
      "We redesign your navigation and site hierarchy so content is easy to find, logically organised, and aligned with how users actually search and browse.",
  },
  {
    title: "Optimise Your CMS for Efficiency",
    description:
      "We audit your current CMS setup, fix configuration issues, and streamline templates and workflows to make content publishing faster and more consistent.",
  },
  {
    title: "Integrate Content with Your MarTech Stack",
    description:
      "We connect your CMS with analytics, marketing automation, CRM, and other tools \u2014 so content flows seamlessly across your digital ecosystem.",
  },
  {
    title: "Set Up Digital Asset Management",
    description:
      "We implement or optimise your DAM platform to centralise brand assets, reduce duplication, and ensure teams always find the right file fast.",
  },
  {
    title: "Enterprise Search & Findability",
    description:
      "We design and implement search experiences that make content discoverable across intranets, websites, and content repositories.",
  },
  {
    title: "Content Platform Selection & Advisory",
    description:
      "We evaluate CMS, DAM, and DXP options against your real needs \u2014 cutting through vendor noise to recommend the right fit for your organisation.",
  },
];

export default function ContentTechnologyPage() {
  return (
    <ServicePageLayout
      title="CONTENT TECHNOLOGY"
      heroDescription="Elevate your content with cutting-edge technology. Maximize your content\u2019s potential with our Content Technology Management Services. We offer advisory and implementation services to help you create, manage, store, and distribute content seamlessly across multiple channels. This includes content management systems (CMS), digital asset management (DAM) platforms, and enterprise search solutions."
      packages={packages}
    />
  );
}
