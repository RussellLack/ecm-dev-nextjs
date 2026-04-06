import { defineType, defineField } from "sanity";

export default defineType({
  name: "guide",
  title: "Guide",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "series",
      title: "Series Name",
      type: "string",
      description: "e.g. Foundations, Technology, Operations",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seriesNumber",
      title: "Series Number",
      type: "number",
      description: "Order of this series in the page (1 = first band)",
    }),
    defineField({
      name: "guideNumber",
      title: "Guide Number",
      type: "number",
      description: "Guide number within the series",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "relatedGuides",
      title: "Related Guides",
      description: "Internal linking suggestions — guides that contextually relate to this one",
      type: "array",
      of: [{ type: "reference", to: [{ type: "guide" }] }],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    select: {
      title: "title",
      series: "series",
      guideNumber: "guideNumber",
      media: "mainImage",
    },
    prepare({ title, series, guideNumber, media }) {
      return {
        title,
        media,
        subtitle: series ? `${series} â Guide ${guideNumber ?? ""}` : "No series",
      };
    },
  },
});
