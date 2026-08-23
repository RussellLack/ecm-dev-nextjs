import { defineType, defineField } from "sanity";

const cta = {
  type: "object" as const,
  fields: [
    { name: "label", title: "Label", type: "string" as const },
    { name: "url", title: "URL", type: "string" as const },
  ],
};

export default defineType({
  name: "buildPage",
  title: "Build Landing Page",
  type: "document",
  fields: [
    defineField({ name: "hero", title: "Hero headline", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "subheadline", title: "Subheadline", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: "primaryCTA", title: "Primary CTA", ...cta }),
    defineField({ name: "secondaryCTA", title: "Secondary CTA", ...cta }),

    defineField({ name: "problemsHeading", title: "Problems heading", type: "string" }),
    defineField({ name: "problemsSubheading", title: "Problems subheading", type: "string" }),
    defineField({
      name: "problems",
      title: "Problems",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "number", title: "Number", type: "string" },
            { name: "title", title: "Title", type: "string" },
            { name: "body", title: "Body", type: "text", rows: 3 },
          ],
          preview: { select: { title: "title", subtitle: "number" } },
        },
      ],
    }),

    defineField({ name: "deliverablesHeading", title: "Deliverables heading", type: "string" }),
    defineField({
      name: "deliverables",
      title: "Deliverables",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "body", title: "Body", type: "text", rows: 3 },
            { name: "price", title: "Price", type: "string" },
            { name: "turnaround", title: "Turnaround", type: "string" },
          ],
          preview: { select: { title: "title", subtitle: "price" } },
        },
      ],
    }),

    defineField({ name: "howWeWorkHeading", title: "How we work heading", type: "string" }),
    defineField({
      name: "steps",
      title: "How we work steps",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "number", title: "Number", type: "string" },
            { name: "title", title: "Title", type: "string" },
            { name: "body", title: "Body", type: "text", rows: 3 },
          ],
          preview: { select: { title: "title", subtitle: "number" } },
        },
      ],
    }),

    defineField({ name: "ctaHeading", title: "Bottom CTA heading", type: "string" }),
    defineField({ name: "ctaSubheading", title: "Bottom CTA subheading", type: "string" }),
    defineField({ name: "ctaButtonLabel", title: "Bottom CTA button label", type: "string" }),
    defineField({ name: "ctaButtonUrl", title: "Bottom CTA button URL", type: "string" }),

    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        { name: "title", title: "Title", type: "string" },
        { name: "description", title: "Description", type: "text", rows: 2 },
      ],
    }),
  ],
  preview: { select: { title: "hero" } },
});
