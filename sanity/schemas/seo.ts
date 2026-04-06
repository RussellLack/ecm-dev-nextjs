import { defineType, defineField } from "sanity";

export default defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
      description:
        "Override the default page title for search engines. Keep under 60 characters.",
      validation: (rule) =>
        rule.max(70).warning("Meta titles over 60 characters may be truncated in search results."),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 3,
      description:
        "A short summary shown in search results. Keep between 120–160 characters.",
      validation: (rule) =>
        rule
          .max(170)
          .warning("Meta descriptions over 160 characters may be truncated."),
    }),
    defineField({
      name: "ogImage",
      title: "Social Sharing Image",
      type: "image",
      description:
        "Image shown when shared on social media. Recommended size: 1200 x 630px.",
      options: { hotspot: true },
    }),
    defineField({
      name: "noIndex",
      title: "Hide from Search Engines",
      type: "boolean",
      description: "If enabled, this page will not appear in search engine results.",
      initialValue: false,
    }),
  ],
});
