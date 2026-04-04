import { defineType, defineField } from "sanity";

export default defineType({
  name: "maturityBand",
  title: "Maturity Band",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Band Title",
      type: "string",
      description: "e.g. Ad Hoc, Developing, Structured, Optimised",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "level",
      title: "Level",
      type: "number",
      description: "Numeric level (1 = lowest, 4 = highest)",
      validation: (Rule) => Rule.required().min(1).max(10),
    }),
    defineField({
      name: "minScore",
      title: "Minimum Score (%)",
      type: "number",
      description: "Lower bound of this band (inclusive)",
      validation: (Rule) => Rule.required().min(0).max(100),
    }),
    defineField({
      name: "maxScore",
      title: "Maximum Score (%)",
      type: "number",
      description: "Upper bound of this band (inclusive)",
      validation: (Rule) => Rule.required().min(0).max(100),
    }),
    defineField({
      name: "headline",
      title: "Results Headline",
      type: "string",
      description: "Shown at top of results page, e.g. 'Your content operations are largely reactive'",
    }),
    defineField({
      name: "description",
      title: "Band Description",
      type: "text",
      rows: 4,
      description: "Detailed explanation of what this maturity level means for the organisation",
    }),
    defineField({
      name: "color",
      title: "Brand Color",
      type: "string",
      description: "Hex color for UI theming (e.g. #EF4444 for red, #F59E0B for amber)",
    }),
    defineField({
      name: "assessment",
      title: "Assessment",
      type: "reference",
      to: [{ type: "assessment" }],
      description: "Which assessment this band belongs to",
    }),
  ],
  orderings: [
    { title: "Level", name: "levelAsc", by: [{ field: "level", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "level" },
    prepare({ title, subtitle }) {
      return { title, subtitle: `Level ${subtitle}` };
    },
  },
});
