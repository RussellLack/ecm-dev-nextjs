import { defineType, defineField } from "sanity";

export default defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Service Name",
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
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Content Technology", value: "technology" },
          { title: "Content Services", value: "services" },
          { title: "Content Localization", value: "localization" },
        ],
      },
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroDescription",
      title: "Hero Description",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "problemIntro",
      title: "Problem Intro",
      description:
        "Lead paragraph(s) setting up the problem. Separate paragraphs with a blank line — the first paragraph renders as a large bold lead statement.",
      type: "text",
      rows: 8,
    }),
    defineField({
      name: "diagnosisItems",
      title: "Diagnosis Items",
      description:
        "Symptoms shown inside the \u201CYou probably recognise this\u201D callout as a dashed list.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "reframeStatement",
      title: "Reframe Statement",
      description:
        "Large bold reframe shown on the grey panel after the diagnosis box.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ctaText",
      title: "CTA Supporting Text",
      description: "Small muted text shown above the dark-band CTA link.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "ctaUrl",
      title: "CTA URL",
      description:
        "Destination for the dark-band CTA link (e.g. the maturity assessment).",
      type: "url",
      validation: (rule) =>
        rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "image",
      title: "Service Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
});
