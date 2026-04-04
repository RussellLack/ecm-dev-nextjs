import { defineType, defineField } from "sanity";

export default defineType({
  name: "assessmentSubmission",
  title: "Assessment Submission",
  type: "document",
  fields: [
    defineField({
      name: "assessment",
      title: "Assessment",
      type: "reference",
      to: [{ type: "assessment" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),

    // Contact info
    defineField({
      name: "firstName",
      title: "First Name",
      type: "string",
    }),
    defineField({
      name: "lastName",
      title: "Last Name",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),

    // Scores
    defineField({
      name: "totalScore",
      title: "Total Score (%)",
      type: "number",
    }),
    defineField({
      name: "bandLevel",
      title: "Band Level",
      type: "number",
    }),
    defineField({
      name: "bandTitle",
      title: "Band Title",
      type: "string",
    }),
    defineField({
      name: "dimensionScores",
      title: "Dimension Scores",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "dimensionKey", title: "Dimension Key", type: "string" }),
            defineField({ name: "dimensionTitle", title: "Dimension Title", type: "string" }),
            defineField({ name: "score", title: "Score (%)", type: "number" }),
          ],
          preview: {
            select: { title: "dimensionTitle", subtitle: "score" },
            prepare({ title, subtitle }) {
              return { title, subtitle: `${subtitle}%` };
            },
          },
        },
      ],
    }),
    defineField({
      name: "weakAreas",
      title: "Weakest Areas",
      type: "array",
      of: [{ type: "string" }],
    }),

    // Raw answers for audit trail
    defineField({
      name: "answers",
      title: "Raw Answers",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "questionId", title: "Question ID", type: "string" }),
            defineField({ name: "optionId", title: "Option ID", type: "string" }),
          ],
        },
      ],
    }),

    // Tracking
    defineField({
      name: "tracking",
      title: "Tracking Data",
      type: "object",
      fields: [
        defineField({ name: "utmSource", title: "UTM Source", type: "string" }),
        defineField({ name: "utmMedium", title: "UTM Medium", type: "string" }),
        defineField({ name: "utmCampaign", title: "UTM Campaign", type: "string" }),
        defineField({ name: "utmContent", title: "UTM Content", type: "string" }),
        defineField({ name: "utmTerm", title: "UTM Term", type: "string" }),
        defineField({ name: "referrer", title: "Referrer", type: "string" }),
        defineField({ name: "landingPage", title: "Landing Page", type: "string" }),
      ],
    }),

    // Intent signals
    defineField({
      name: "requestedContact",
      title: "Requested Contact",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "timeToCompleteSeconds",
      title: "Time to Complete (seconds)",
      type: "number",
    }),
  ],
  orderings: [
    { title: "Newest First", name: "submittedDesc", by: [{ field: "submittedAt", direction: "desc" }] },
  ],
  preview: {
    select: {
      firstName: "firstName",
      lastName: "lastName",
      company: "company",
      bandTitle: "bandTitle",
      totalScore: "totalScore",
      date: "submittedAt",
    },
    prepare({ firstName, lastName, company, bandTitle, totalScore, date }) {
      const name = [firstName, lastName].filter(Boolean).join(" ") || "Anonymous";
      const dateStr = date ? new Date(date).toLocaleDateString() : "";
      return {
        title: `${name}${company ? ` — ${company}` : ""}`,
        subtitle: `${bandTitle || "Pending"} (${totalScore ?? "?"}%) — ${dateStr}`,
      };
    },
  },
});
