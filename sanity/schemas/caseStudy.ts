import { defineType, defineField } from "sanity";

export default defineType({
  name: "caseStudy",
  title: "Case Study",
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
      options: { source: "title" },
    }),
    defineField({
      name: "client",
      title: "Client Description",
      type: "string",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Short summary shown on the case study index page.",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "whoThisIsFor",
      title: "Who This Is For",
      description: "Describe the ideal client profile for this type of engagement.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "theChallenge",
      title: "The Challenge",
      description: "Describe the problem the client faced.",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "whatWePropose",
      title: "What We Propose",
      description: "Describe the services and approach ECM.DEV brings to this type of engagement.",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "whyItMatters",
      title: "Why It Matters",
      description: "The outcomes and value delivered — why this work makes a difference.",
      type: "text",
      rows: 4,
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
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
});
