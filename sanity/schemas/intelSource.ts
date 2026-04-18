import { defineType, defineField } from "sanity";

export default defineType({
  name: "intelSource",
  title: "Intel — Source (RSS feed)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "feedUrl",
      type: "url",
      validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "homepageUrl",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "defaultTopics",
      type: "array",
      of: [{ type: "reference", to: [{ type: "intelTopic" }] }],
    }),
    defineField({
      name: "active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({ name: "lastFetchedAt", type: "datetime", readOnly: true }),
    defineField({ name: "lastError", type: "string", readOnly: true }),
  ],
  preview: {
    select: { title: "title", subtitle: "feedUrl", active: "active" },
    prepare: ({ title, subtitle, active }) => ({
      title: `${active ? "✓" : "⏸"} ${title}`,
      subtitle,
    }),
  },
});
