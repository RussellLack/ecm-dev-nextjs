import { defineType, defineField } from "sanity";

export default defineType({
  name: "problemPage",
  title: "Problem We Solve",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description:
        "The buyer's own sentence, used as the nav label and index card (e.g. \"Marketing takes too long\").",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      initialValue: "Problems we solve",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero Heading",
      description: "Large headline. Defaults to the title if left empty.",
      type: "string",
    }),
    defineField({
      name: "heroSubhead",
      title: "Hero Subhead",
      description: "One or two sentences framing the problem for a marketing leader.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "symptoms",
      title: "Does this sound familiar? (symptoms)",
      description: "Short symptom lines shown in the recognition callout.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "realCauseLead",
      title: "The real cause: lead statement",
      description: "Bold one-line lead for the cause section.",
      type: "string",
    }),
    defineField({
      name: "realCause",
      title: "The real cause: body",
      description: "Explain why this is a systems problem. Separate paragraphs with a blank line.",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "cost",
      title: "What it's costing you",
      description: "The commercial consequence: time, cost, risk, missed growth.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "diagnosticLabel",
      title: "Diagnostic CTA label",
      type: "string",
      initialValue: "Take the assessment",
    }),
    defineField({
      name: "diagnosticUrl",
      title: "Diagnostic CTA URL",
      type: "string",
      initialValue: "/assessments",
    }),
    defineField({
      name: "solutionLabel",
      title: "Solution link label",
      type: "string",
    }),
    defineField({
      name: "solutionUrl",
      title: "Solution link URL",
      type: "string",
    }),
    defineField({
      name: "proof",
      title: "Proof (case studies)",
      description: "Outcome-led proof tiles that link to case studies.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "outcome", title: "Outcome", type: "string" },
            { name: "detail", title: "Detail", type: "string" },
            { name: "url", title: "URL", type: "string" },
          ],
          preview: {
            select: { title: "outcome", subtitle: "url" },
          },
        },
      ],
    }),
    defineField({
      name: "relatedReading",
      title: "Related reading",
      description: "Executive Briefings or guides on this theme.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "url", title: "URL", type: "string" },
          ],
          preview: {
            select: { title: "title", subtitle: "url" },
          },
        },
      ],
    }),
    defineField({
      name: "ctaHeading",
      title: "Closing CTA heading",
      type: "string",
      initialValue: "See where you stand.",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
