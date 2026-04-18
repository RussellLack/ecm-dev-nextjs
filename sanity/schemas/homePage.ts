import { defineType, defineField } from "sanity";

export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "heroHeading",
      title: "Hero Heading",
      type: "string",
      initialValue: "Content Infrastructure for the AI Enterprise",
    }),
    defineField({
      name: "heroBody",
      title: "Hero Body",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "symptoms",
      title: "Symptoms Section",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "text" },
          ],
        },
      ],
    }),
    defineField({
      name: "servicesHeading",
      title: "Services Section Heading",
      type: "string",
      initialValue: "SERVICES",
    }),
    defineField({
      name: "learnMoreItems",
      title: "Learn More Cards",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "subtitle", title: "Subtitle", type: "string" },
          ],
        },
      ],
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", title: "Name", type: "string" },
            { name: "role", title: "Role", type: "string" },
            { name: "quote", title: "Quote", type: "text" },
            { name: "commentary", title: "Why This Matters", type: "text" },
          ],
        },
      ],
    }),
    defineField({
      name: "ctaHeading",
      title: "CTA Heading",
      type: "string",
      initialValue: "READY FOR YOUR BUSINESS TO GROW?",
    }),
    defineField({
      name: "ctaSubheading",
      title: "CTA Subheading",
      type: "string",
      initialValue: "CONTACT US",
    }),
  ],
});
