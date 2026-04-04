import { defineType, defineField } from "sanity";

export default defineType({
  name: "maturityDimension",
  title: "Maturity Dimension",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "e.g. Strategy, Governance, Workflow, Technology, Measurement, AI Readiness",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "key",
      title: "Key",
      type: "slug",
      description: "Machine-readable key used in scoring (auto-generated from title)",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "What this dimension measures — shown on the results page",
    }),
    defineField({
      name: "icon",
      title: "Icon Name",
      type: "string",
      description: "Optional icon identifier for the results UI (e.g. 'strategy', 'governance')",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    { title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
});
