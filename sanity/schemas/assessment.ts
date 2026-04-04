import { defineType, defineField, defineArrayMember } from "sanity";

export default defineType({
  name: "assessment",
  title: "Assessment",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "e.g. Content Operations Maturity Assessment",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      description: "Shown below the title on the intro screen",
    }),
    defineField({
      name: "introText",
      title: "Introduction Text",
      type: "text",
      rows: 4,
      description: "Explains what the assessment covers and why it matters",
    }),
    defineField({
      name: "estimatedMinutes",
      title: "Estimated Minutes",
      type: "number",
      description: "How long the assessment takes (shown on intro screen)",
      initialValue: 5,
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "assessmentSection",
          title: "Section",
          fields: [
            defineField({
              name: "title",
              title: "Section Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Section Description",
              type: "text",
              rows: 2,
              description: "Brief intro shown when entering this section",
            }),
            defineField({
              name: "questions",
              title: "Questions",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "assessmentQuestion",
                  title: "Question",
                  fields: [
                    defineField({
                      name: "questionId",
                      title: "Question ID",
                      type: "string",
                      description: "Unique identifier (e.g. q-strategy-1). Used in scoring.",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "text",
                      title: "Question Text",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "helpText",
                      title: "Help Text",
                      type: "text",
                      rows: 2,
                      description: "Optional clarification shown below the question",
                    }),
                    defineField({
                      name: "inputType",
                      title: "Input Type",
                      type: "string",
                      options: {
                        list: [
                          { title: "Single Select", value: "single" },
                          { title: "Multi Select", value: "multi" },
                        ],
                      },
                      initialValue: "single",
                    }),
                    defineField({
                      name: "options",
                      title: "Answer Options",
                      type: "array",
                      of: [
                        defineArrayMember({
                          type: "object",
                          name: "assessmentAnswerOption",
                          title: "Option",
                          fields: [
                            defineField({
                              name: "optionId",
                              title: "Option ID",
                              type: "string",
                              description: "Unique identifier (e.g. q-strategy-1-a)",
                              validation: (Rule) => Rule.required(),
                            }),
                            defineField({
                              name: "label",
                              title: "Label",
                              type: "string",
                              description: "The answer text shown to the user",
                              validation: (Rule) => Rule.required(),
                            }),
                            defineField({
                              name: "dimensionScores",
                              title: "Dimension Scores",
                              type: "array",
                              description: "Points this option awards to each dimension",
                              of: [
                                defineArrayMember({
                                  type: "object",
                                  name: "dimensionScore",
                                  fields: [
                                    defineField({
                                      name: "dimension",
                                      title: "Dimension",
                                      type: "reference",
                                      to: [{ type: "maturityDimension" }],
                                      validation: (Rule) => Rule.required(),
                                    }),
                                    defineField({
                                      name: "points",
                                      title: "Points",
                                      type: "number",
                                      validation: (Rule) => Rule.required().min(0),
                                    }),
                                  ],
                                  preview: {
                                    select: {
                                      dimension: "dimension.title",
                                      points: "points",
                                    },
                                    prepare({ dimension, points }) {
                                      return {
                                        title: `${dimension}: ${points} pts`,
                                      };
                                    },
                                  },
                                }),
                              ],
                            }),
                          ],
                          preview: {
                            select: { title: "label", subtitle: "optionId" },
                          },
                        }),
                      ],
                      validation: (Rule) => Rule.min(2),
                    }),
                    defineField({
                      name: "conditionalOn",
                      title: "Conditional On",
                      type: "object",
                      description: "Only show this question if a previous answer matches",
                      fields: [
                        defineField({
                          name: "questionId",
                          title: "Question ID",
                          type: "string",
                        }),
                        defineField({
                          name: "optionId",
                          title: "Required Option ID",
                          type: "string",
                        }),
                      ],
                    }),
                  ],
                  preview: {
                    select: { title: "text", subtitle: "questionId" },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "title" },
          },
        }),
      ],
    }),
    defineField({
      name: "resultsIntro",
      title: "Results Page Intro",
      type: "text",
      rows: 3,
      description: "Text shown above the score on the results page",
    }),
    defineField({
      name: "resultsCtaHeading",
      title: "Results CTA Heading",
      type: "string",
      description: "Heading for the call-to-action on the results page",
    }),
    defineField({
      name: "resultsCtaBody",
      title: "Results CTA Body",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
