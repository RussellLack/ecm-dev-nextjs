import { defineType, defineField } from "sanity";

export default defineType({
  name: "serviceRecommendation",
  title: "Service Recommendation",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "e.g. 'Content Governance Framework Design'",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "dimension",
      title: "Linked Dimension",
      type: "reference",
      to: [{ type: "maturityDimension" }],
      description: "Which dimension weakness triggers this recommendation",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "service",
      title: "Linked Service",
      type: "reference",
      to: [{ type: "service" }],
      description: "The ECM.dev service this maps to",
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "Brief explanation shown on the results page",
    }),
    defineField({
      name: "priority",
      title: "Priority",
      type: "number",
      description: "Lower number = shown first when this dimension is weak",
      initialValue: 0,
    }),
    defineField({
      name: "minBandLevel",
      title: "Minimum Band Level",
      type: "number",
      description: "Only show this recommendation if the user's band level is at or below this value (e.g. 2 = show for Ad Hoc and Developing only)",
      initialValue: 4,
    }),
  ],
  orderings: [
    { title: "Priority", name: "priorityAsc", by: [{ field: "priority", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "dimension.title" },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? `Dimension: ${subtitle}` : "" };
    },
  },
});
