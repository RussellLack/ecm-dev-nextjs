// Shared taxonomy option lists. Values must stay in sync with route slugs:
//   technology   -> /content-technology
//   services     -> /content-services
//   localization -> /content-localization

export const PILLAR_OPTIONS = [
  { title: "Content Technology", value: "technology" },
  { title: "Content Services", value: "services" },
  { title: "Content Localization", value: "localization" },
] as const;

export const INDUSTRY_OPTIONS = [
  { title: "Financial Services", value: "financial-services" },
  { title: "Healthcare & Life Sciences", value: "healthcare" },
  { title: "Manufacturing & Industrial", value: "manufacturing" },
  { title: "Retail & Consumer", value: "retail" },
  { title: "Technology & Software", value: "technology" },
  { title: "Public Sector", value: "public-sector" },
  { title: "Energy & Utilities", value: "energy" },
  { title: "Professional Services", value: "professional-services" },
  { title: "Other", value: "other" },
] as const;
