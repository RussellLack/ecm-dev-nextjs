import { defineType, defineField } from "sanity";
import { PILLAR_OPTIONS, TOPIC_OPTIONS } from "./taxonomyOptions";

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
      name: "visualConcept",
      title: "Visual concept (illustration hint)",
      type: "text",
      rows: 2,
      description:
        "Auto-populated by the intel → blog send-to-blog action. 2-3 concrete objects to paste into AI Assist when generating the Main Image. Doesn't render on the public site — safe to leave in place or delete after use.",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "topics",
      title: "Topics",
      description:
        "Canonical topic tags. Pick from the fixed list — the intel enricher uses these same 12 topics so filtering on /blog stays consistent. For company / product mentions (Sitecore, Umbraco, etc.), use Vendors below instead.",
      type: "array",
      of: [{ type: "string", options: { list: [...TOPIC_OPTIONS] } }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "vendors",
      title: "Vendors / Products",
      description:
        "Named companies or products mentioned in the post (e.g. Sitecore, Umbraco, Kentico Xperience). Free-form — type and press Enter. Do NOT put generic category words (CMS, DXP) here; those go in Topics.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "tags",
      title: "Tags (deprecated — use Topics + Vendors instead)",
      description:
        "Legacy field. Migrated data lives in Topics + Vendors. Kept read-only for one release cycle before removal.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      readOnly: true,
      hidden: ({ document }) =>
        !document?.tags || (document.tags as string[]).length === 0,
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
        {
          type: "block",
          marks: {
            annotations: [
              { type: "internalLink" },
              {
                name: "link",
                type: "object",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    validation: (rule: any) =>
                      rule.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                        allowRelative: false,
                      }),
                  },
                ],
              },
            ],
          },
        },
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
