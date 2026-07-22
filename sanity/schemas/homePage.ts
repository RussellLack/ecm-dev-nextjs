import { defineType, defineField } from "sanity";

const linkUrl = { type: "string" as const };

export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    // ── Hero ──
    defineField({
      name: "heroHeading",
      title: "Hero Heading",
      type: "string",
      initialValue: "Marketing isn't slowing down. Your content infrastructure is.",
    }),
    defineField({
      name: "heroBody",
      title: "Hero Body",
      description: "Separate paragraphs with a blank line.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "heroCta",
      title: "Hero Buttons",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        { name: "primaryLabel", title: "Primary button label", type: "string" },
        { name: "primaryUrl", title: "Primary button URL", ...linkUrl },
        { name: "primaryNote", title: "Primary button note (e.g. 10 min)", type: "string" },
        { name: "secondaryLabel", title: "Secondary button label", type: "string" },
        { name: "secondaryUrl", title: "Secondary button URL", ...linkUrl },
      ],
    }),

    // ── Symptoms ──
    defineField({
      name: "symptomsHeading",
      title: "Symptoms Section Heading",
      type: "string",
      initialValue: "You probably recognise at least one of these.",
    }),
    defineField({
      name: "symptomsSubhead",
      title: "Symptoms Section Subhead",
      type: "text",
      rows: 2,
      initialValue:
        "Six symptoms. One underlying cause: content was never built as infrastructure.",
    }),
    defineField({
      name: "symptoms",
      title: "Symptoms",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "text" },
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        },
      ],
    }),

    // ── Outcome cards (was Services) ──
    defineField({
      name: "servicesHeading",
      title: "Outcomes Section Heading",
      type: "string",
      initialValue: "What changes when the infrastructure is right",
    }),
    defineField({
      name: "outcomeCards",
      title: "Outcome Cards",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "text", rows: 3 },
            { name: "url", title: "URL", ...linkUrl },
            {
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "Operations (clipboard)", value: "services" },
                  { title: "Global (globe)", value: "localization" },
                  { title: "Technology (monitor)", value: "technology" },
                ],
              },
              initialValue: "services",
            },
          ],
          preview: { select: { title: "title", subtitle: "url" } },
        },
      ],
    }),

    // ── Proof band ──
    defineField({
      name: "proofHeading",
      title: "Proof Section Heading",
      type: "string",
      initialValue: "Fix the system, and the results follow.",
    }),
    defineField({
      name: "proofSubhead",
      title: "Proof Section Subhead",
      type: "text",
      rows: 2,
      initialValue:
        "Real outcomes from enterprise teams who fixed the operation underneath their content, not just the content itself.",
    }),
    defineField({
      name: "proofTiles",
      title: "Proof Tiles",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "outcome", title: "Outcome", type: "string" },
            { name: "detail", title: "Detail", type: "string" },
            { name: "url", title: "URL", ...linkUrl },
          ],
          preview: { select: { title: "outcome", subtitle: "url" } },
        },
      ],
    }),

    // ── Learn More ──
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

    // ── Diagnostic band ──
    defineField({
      name: "diagnosticHeading",
      title: "Diagnostic Band Heading",
      type: "string",
      initialValue: "Not sure where your infrastructure is costing you most?",
    }),
    defineField({
      name: "diagnosticBody",
      title: "Diagnostic Band Body",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "diagnosticCtaLabel",
      title: "Diagnostic Band Button Label",
      type: "string",
      initialValue: "Start the assessment",
    }),
    defineField({
      name: "diagnosticCtaUrl",
      title: "Diagnostic Band Button URL",
      ...linkUrl,
    }),

    // ── Ticker ──
    defineField({
      name: "tickerPhrases",
      title: "Ticker Phrases",
      type: "array",
      of: [{ type: "string" }],
    }),

    // ── Testimonials ──
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

    // ── Closing CTA ──
    defineField({
      name: "ctaHeading",
      title: "Closing CTA Heading",
      type: "string",
      initialValue: "Find out where content infrastructure is holding your marketing back.",
    }),
    defineField({
      name: "ctaSubheading",
      title: "Closing CTA Subheading",
      type: "string",
      initialValue: "The ten-minute assessment shows you where to start.",
    }),
    defineField({
      name: "closingCtaLabel",
      title: "Closing CTA Button Label",
      type: "string",
      initialValue: "Assess your content infrastructure",
    }),
    defineField({
      name: "closingCtaUrl",
      title: "Closing CTA Button URL",
      ...linkUrl,
    }),
    defineField({
      name: "closingSecondaryLabel",
      title: "Closing CTA Secondary Link Label",
      type: "string",
      initialValue: "or book a strategy session",
    }),
    defineField({
      name: "closingSecondaryUrl",
      title: "Closing CTA Secondary Link URL",
      ...linkUrl,
    }),

    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
});
