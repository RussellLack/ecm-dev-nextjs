import { defineType, defineField } from "sanity";
import { PILLAR_OPTIONS } from "./taxonomyOptions";

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
        list: [...PILLAR_OPTIONS],
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
      name: "href",
      title: "Direct link (optional)",
      description:
        "Send this package's button straight to a self-serve tool (e.g. /assessment/localisation-cost) instead of the default /contact enquiry link. Leave empty for packages that only make sense as a conversation.",
      type: "url",
      validation: (rule) =>
        rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
});
