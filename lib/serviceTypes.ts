export type ServicePackage = {
  title: string;
  description: string;
  features: string[];
  order: number;
  /** Direct link to a self-serve tool (e.g. the Localisation Cost
   * Estimator), when this package has one. Falls back to a /contact
   * link when empty. */
  href?: string;
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
