import { defineType, defineField } from "sanity";

export default defineType({
  name: "intelArticle",
  title: "Intel — Article",
  type: "document",
  fields: [
    // Identity
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      type: "url",
      validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "urlHash",
      type: "string",
      description:
        "SHA-1 of the normalised URL. Used by the ingester for dedup.",
      readOnly: true,
    }),
    defineField({
      name: "source",
      type: "reference",
      to: [{ type: "intelSource" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "publishedDate", type: "datetime" }),
    defineField({ name: "ingestedAt", type: "datetime", readOnly: true }),

    // Raw content from the feed
    defineField({
      name: "rawContent",
      title: "Raw content (from feed)",
      type: "text",
      rows: 10,
      readOnly: true,
    }),

    // AI enrichment
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Raw (awaiting enrichment)", value: "raw" },
          { title: "Enriched (ready for review)", value: "enriched" },
          { title: "Published", value: "published" },
          { title: "Rejected", value: "rejected" },
        ],
        layout: "radio",
      },
      initialValue: "raw",
    }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    defineField({ name: "keyInsight", type: "text", rows: 2 }),
    defineField({
      name: "topics",
      type: "array",
      of: [{ type: "reference", to: [{ type: "intelTopic" }] }],
    }),
    defineField({
      name: "vendors",
      type: "array",
      of: [{ type: "reference", to: [{ type: "intelVendor" }] }],
    }),
    defineField({ name: "contentAngle", type: "text", rows: 3 }),
    defineField({ name: "linkedinPost", type: "text", rows: 8 }),

    // Observability
    defineField({
      name: "processingLog",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      status: "status",
      source: "source.title",
      date: "publishedDate",
    },
    prepare: ({ title, status, source, date }) => ({
      title: `[${status ?? "raw"}] ${title}`,
      subtitle: `${source ?? "?"} · ${
        date ? new Date(date).toLocaleDateString("en-GB") : "—"
      }`,
    }),
  },
});
