import { defineType, defineField } from "sanity";
import { PILLAR_OPTIONS } from "./taxonomyOptions";

export default defineType({
  name: "post",
  title: "Blog Post",
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
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
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
      name: "pillars",
      title: "Service Pillars",
      description:
        "Which service pillar(s) this post supports. Drives cross-linking from /content-technology, /content-services, /content-localization.",
      type: "array",
      of: [{ type: "string" }],
      options: { list: [...PILLAR_OPTIONS] },
    }),
    defineField({
      name: "relatedPosts",
      title: "Related Posts",
      description:
        "Editor-curated related posts. Falls back to shared-tag matches when empty.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "post" }] }],
      validation: (rule) => rule.max(6),
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
      media: "mainImage",
      date: "publishedAt",
    },
    prepare({ title, media, date }) {
      return {
        title,
        media,
        subtitle: date
          ? new Date(date).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "No date",
      };
    },
  },
});
