import { defineType, defineField } from "sanity";

export default defineType({
  name: "cornerstone",
  title: "Cornerstone Essay",
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      initialValue: "Executive briefing",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero Heading",
      description: "Headline. Defaults to the title if left empty.",
      type: "string",
    }),
    defineField({
      name: "standfirst",
      title: "Standfirst",
      description: "The opening summary line beneath the headline.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "keyTakeaways",
      title: "In short (key takeaways)",
      description: "Three or four board-level takeaways shown in a summary box.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Subheading", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "string", title: "URL" }],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "diagnosticLabel",
      title: "Diagnostic CTA label",
      type: "string",
      initialValue: "Take the assessment",
    }),
    defineField({
      name: "diagnosticUrl",
      title: "Diagnostic CTA URL",
      type: "string",
      initialValue: "/assessments",
    }),
    defineField({
      name: "relatedLinks",
      title: "Related reading and next steps",
      description: "Spokes: the guides and solutions this essay links out to.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "url", title: "URL", type: "string" },
          ],
          preview: { select: { title: "title", subtitle: "url" } },
        },
      ],
    }),
    defineField({
      name: "ctaHeading",
      title: "Closing CTA heading",
      type: "string",
      initialValue: "See where you stand.",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});
