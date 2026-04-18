import { defineType, defineField } from "sanity";

export default defineType({
  name: "intelTopic",
  title: "Intel — Topic",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 64 },
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
