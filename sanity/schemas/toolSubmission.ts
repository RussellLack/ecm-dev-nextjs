import { defineType, defineField } from "sanity";

/**
 * Stores submissions from self-contained assessment tools
 * (Process Assessment, Lead Magnet Ideation) that don't use
 * Sanity-stored questions or server-side scoring.
 *
 * The `results` field holds the full computed output as JSON
 * so the results page can render without re-computing.
 */
export default defineType({
  name: "toolSubmission",
  title: "Tool Submission",
  type: "document",
  fields: [
    defineField({
      name: "toolType",
      title: "Tool Type",
      type: "string",
      options: {
        list: [
          { title: "Process Assessment", value: "process" },
          { title: "Lead Magnet Ideation", value: "lead-magnet" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),

    // Contact info (optional — only populated if GDPR consent given)
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({
      name: "consentGiven",
      title: "GDPR Consent Given",
      type: "boolean",
      initialValue: false,
    }),

    // Full assessment data — stored as JSON so the results page can
    // render the exact same output without client-side state
    defineField({
      name: "answers",
      title: "Raw Answers (JSON)",
      type: "text",
      description: "Serialised JSON of all user answers",
    }),
    defineField({
      name: "results",
      title: "Computed Results (JSON)",
      type: "text",
      description:
        "Serialised JSON of computed results (scores, flags, recommendations, etc.)",
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
        defineField({ name: "referrer", title: "Referrer", type: "string" }),
      ],
    }),
    defineField({
      name: "timeToCompleteSeconds",
      title: "Time to Complete (seconds)",
      type: "number",
    }),
  ],
  orderings: [
    {
      title: "Newest First",
      name: "submittedDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      toolType: "toolType",
      name: "name",
      company: "company",
      date: "submittedAt",
    },
    prepare({ toolType, name, company, date }) {
      const label =
        toolType === "process"
          ? "Process"
          : toolType === "lead-magnet"
            ? "Lead Magnet"
            : toolType;
      const who = name || "Anonymous";
      const dateStr = date
        ? new Date(date).toLocaleDateString()
        : "";
      return {
        title: `[${label}] ${who}${company ? ` — ${company}` : ""}`,
        subtitle: dateStr,
      };
    },
  },
});
