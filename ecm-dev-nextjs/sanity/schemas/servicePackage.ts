import { defineType, defineField } from "sanity";

export default defineType({
  name: "servicePackage",
  title: "Service Package",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Package Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),
    defineField({
      name: "category",
      title: "Service Category",
      type: "string",
      options: {
        list: [
          { title: "Content Technology", value: "technology" },
          { title: "Content Services", value: "services" },
          { title: "Content Localization", value: "localization" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "features",
      title: "Features / Deliverables",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "cta",
      title: "CTA Label",
      type: "string",
      initialValue: "LEARN MORE",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
});
