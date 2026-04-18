import { defineType, defineField } from "sanity";

export default defineType({
  name: "intelVendor",
  title: "Intel — Vendor",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      options: {
        list: ["CMS", "DAM", "PIM", "DXP", "AI", "Analytics", "Other"],
      },
    }),
    defineField({ name: "website", type: "url" }),
  ],
  preview: {
    select: { title: "name", subtitle: "category" },
  },
});
