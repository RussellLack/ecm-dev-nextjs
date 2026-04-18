import ServicePageLayout from "@/components/ServicePageLayout";

const packages = [
  {
    title: "Fast Turnaround Translation \u2013 4 Hour Delivery",
    description:
      "Get urgent, premium translations in 4 business hours \u2014 every time. Our subscription lets teams rely on fast, consistent translations in fixed language pairs, with no drop in quality or tone.",
  },
  {
    title: "Large Localization Package",
    description:
      "A full-scale content localization solution for large websites, product documentation, or platform UIs. Designed to deliver consistency, speed, and language accuracy across multiple regions and content formats.",
  },
  {
    title: "Find & Fix Underperforming Global Content",
    description:
      "We help you identify which content is underperforming in specific markets and deliver actionable recommendations to improve relevance, engagement, and conversions.",
  },
  {
    title: "Multilingual SEO Optimisation",
    description:
      "We audit and optimise your multilingual content for search engines \u2014 including hreflang implementation, keyword localisation, and metadata translation.",
  },
  {
    title: "Website Translation Setup & Configuration",
    description:
      "We set up and configure translation management tools integrated with your CMS, ensuring efficient workflows for ongoing multilingual content delivery.",
  },
  {
    title: "Marketing Collateral Localization",
    description:
      "We localise documents, presentations, social media posts, graphics, and videos with machine translation enhanced by human editing for quality assurance.",
  },
];

export default function ContentLocalizationPage() {
  return (
    <ServicePageLayout
      title="CONTENT LOCALIZATION"
      heroDescription="Our marketing collateral localization services offer a combination of machine translation with human editing to ensure high-quality translations. These packages cover documents, websites, presentations, social media posts, graphics, and videos, providing fixed deliverables per language pairing within a specific time frame."
      packages={packages}
    />
  );
}
