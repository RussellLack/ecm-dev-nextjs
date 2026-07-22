import { defineType, defineField } from "sanity";

export default defineType({
  name: "solutionPage",
  title: "Solution",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: "The outcome, used as the nav label and index card (e.g. \"Improve Campaign Velocity\").",
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
      initialValue: "Solutions",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero Heading",
      description: "The outcome as a headline. Defaults to the title if left empty.",
      type: "string",
    }),
    defineField({
      name: "heroSubhead",
      title: "The promise",
      description: "What changes for the buyer, in commercial terms.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "howItWorks",
      title: "How it works",
      description: "The approach. Separate paragraphs with a blank line.",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "includes",
      title: "What's included",
      description: "The relevant engagements, presented as steps.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "text", rows: 2 },
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        },
      ],
    }),
    defineField({
      name: "proof",
      title: "Proof (case studies)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "outcome", title: "Outcome", type: "string" },
            { name: "detail", title: "Detail", type: "string" },
            { name: "url", title: "URL", type: "string" },
          ],
          preview: { select: { title: "outcome", subtitle: "url" } },
        },
      ],
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
      name: "depthLabel",
      title: "Depth link label",
      description: "Link to the underlying service page for the reader who wants the detail.",
      type: "string",
    }),
    defineField({
      name: "depthUrl",
      title: "Depth link URL",
      type: "string",
    }),
    defineField({
      name: "ctaHeading",
      title: "Closing CTA heading",
      type: "string",
      initialValue: "See where you stand.",
    }),
    defineField({
      name: "ctaLabel",
      title: "Closing CTA label",
      type: "string",
      initialValue: "Take the assessment",
    }),
    defineField({
      name: "ctaUrl",
      title: "Closing CTA URL",
      type: "string",
      initialValue: "/assessments",
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
  preview: { select: { title: "title", subtitle: "slug.current" } },
});
