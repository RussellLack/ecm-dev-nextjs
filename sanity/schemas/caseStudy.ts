import { defineType, defineField } from "sanity";
import { PILLAR_OPTIONS, INDUSTRY_OPTIONS } from "./taxonomyOptions";

export default defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),
    defineField({
      name: "client",
      title: "Client Description",
      type: "string",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "pillars",
      title: "Service Pillars",
      description:
        "Which service pillar(s) this case study supports. Drives cross-linking from /content-technology, /content-services, /content-localization.",
      type: "array",
      of: [{ type: "string" }],
      options: { list: [...PILLAR_OPTIONS] },
    }),
    defineField({
      name: "industry",
      title: "Industry",
      description:
        "Primary industry. Powers future /industries/<slug> hub pages and cross-linking between case studies.",
      type: "string",
      options: { list: [...INDUSTRY_OPTIONS] },
    }),
    defineField({
      name: "relatedCaseStudies",
      title: "Related Case Studies",
      description:
        "Editor-curated related case studies. Falls back to shared-pillar/industry matches when empty.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "caseStudy" }] }],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Short summary shown on the case study index page.",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "whoThisIsFor",
      title: "Who This Is For",
      description: "Describe the ideal client profile for this type of engagement.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "theChallenge",
      title: "The Challenge",
      description: "Describe the problem the client faced.",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "whatWePropose",
      title: "What We Propose",
      description: "Describe the services and approach ECM.DEV brings to this type of engagement.",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "whyItMatters",
      title: "Why It Matters",
      description: "The outcomes and value delivered — why this work makes a difference.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          marks: {
            annotations: [
              { type: "internalLink" },
              {
                name: "link",
                type: "object",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    validation: (rule: any) =>
                      rule.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                        allowRelative: false,
                      }),
                  },
                ],
              },
            ],
          },
        },
        { type: "image", options: { hotspot: true } },
      ],
    }),
    defineField({
      name: "attribution",
      title: "Attribution",
      description:
        "For work delivered while employed elsewhere: the role, the employer/team, and a non-endorsement note. Do not name Russell personally, refer instead to \"the people now behind ECM.DEV\" so the attribution reads as institutional. Shown in small text at the end of the case study. Leave blank for ECM.DEV's own work.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      description: "Show this case study as a summary card on the homepage, linking through to the full case study.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "featuredOrder",
      title: "Featured Display Order",
      description: "Order among featured case studies on the homepage. Lower numbers show first.",
      type: "number",
      hidden: ({ document }) => !document?.featured,
    }),
    defineField({
      name: "featuredTagline",
      title: "Featured Card Tagline",
      description: "Short category line shown on the homepage featured card, e.g. \"Buyer education · Lead qualification · CRM integration\".",
      type: "string",
      hidden: ({ document }) => !document?.featured,
    }),
  ],
});
