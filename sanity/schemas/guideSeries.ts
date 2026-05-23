import { defineType, defineField } from "sanity";

/**
 * Guide series hub. Editorial framing for one of the six guide series.
 *
 * Join model: this doc is slug-keyed and does NOT own its guides via
 * references. Guides keep their existing `series` string field; the
 * series page filters guides where `guide.series == guideSeries.title`.
 * `title` MUST match the guide `series` string exactly for the join to
 * resolve (e.g. "AI-Driven Content Systems").
 */
export default defineType({
  name: "guideSeries",
  title: "Guide Series",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Series Title",
      type: "string",
      description:
        'Must match the guide "Series Name" string exactly (e.g. "Foundations").',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Sort position 1–6 across the series listing.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "~10 words, appears as the subtitle under the H1.",
      validation: (rule) =>
        rule.max(120).warning("Keep the tagline short — around 10 words."),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "array",
      of: [{ type: "block" }],
      description:
        "2–3 paragraphs of editorial framing, same voice as the guide intros.",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      validation: (rule) =>
        rule.max(60).warning("Meta titles over 60 characters may be truncated."),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
      validation: (rule) =>
        rule.max(160).warning("Meta descriptions over 160 characters may be truncated."),
    }),
  ],
  orderings: [
    {
      title: "Series order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", order: "order", subtitle: "tagline" },
    prepare({ title, order, subtitle }) {
      return {
        title: `${order ?? "?"}. ${title}`,
        subtitle,
      };
    },
  },
});
