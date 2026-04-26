export type ServicePackage = {
  title: string;
  description: string;
  features: string[];
  order: number;
};

export type ServicePageData = {
  title: string;
  category: "technology" | "services" | "localization";
  heroDescription: string;
  problemIntro: string;
  diagnosisItems: string[];
  reframeStatement: string;
  ctaText: string;
  ctaUrl: string;
  packages: ServicePackage[];
};

export type ServiceSummary = {
  title: string;
  summary: string;
  heroDescription: string;
  slug: string;
  category: "technology" | "services" | "localization";
};
