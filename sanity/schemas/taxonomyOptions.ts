// Shared taxonomy option lists. Values must stay in sync with route slugs:
//   technology   -> /content-technology
//   services     -> /content-services
//   localization -> /content-localization

export const PILLAR_OPTIONS = [
  { title: "Content Technology", value: "technology" },
  { title: "Content Services", value: "services" },
  { title: "Content Localization", value: "localization" },
] as const;

// Canonical topic taxonomy for blog posts. Must stay in sync with:
//   - workers/enrich.ts ALLOWED_TOPICS in ecm-dev-intel-studio
//   - scripts/backfill-blog-tags.ts ALLOWED_TOPICS in ecm-dev-intel-studio
// These 12 topics are the ONLY values allowed in post.topics. Named
// platform / product / vendor mentions (Sitecore, Umbraco, n8n, etc.)
// go into post.platforms as free-form strings.
export const TOPIC_OPTIONS = [
  { title: "ContentOps", value: "ContentOps" },
  { title: "AI", value: "AI" },
  { title: "CMS", value: "CMS" },
  { title: "Governance", value: "Governance" },
  { title: "DAM", value: "DAM" },
  { title: "PIM", value: "PIM" },
  { title: "DXP", value: "DXP" },
  { title: "Workflow", value: "Workflow" },
  { title: "Personalization", value: "Personalization" },
  { title: "Analytics", value: "Analytics" },
  { title: "Search", value: "Search" },
  { title: "Compliance", value: "Compliance" },
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
