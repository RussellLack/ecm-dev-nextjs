import { defineType, defineField } from "sanity";

/**
 * Inline rename-safe internal link.
 *
 * Used as a Portable Text annotation on body fields (post, guide, caseStudy).
 * Editors pick a target document; the renderer resolves it to a route at
 * query time. Slug renames or moves don't break links because nothing here
 * stores a URL string.
 *
 * Allowed targets are the document types that have a public detail page on
 * the site:
 *   post       → /post/<slug>
 *   guide      → /guide/<slug>
 *   caseStudy  → /case-study/<slug>
 *   assessment → /assessment/<slug>
 *
 * Service-pillar pages (/content-technology, etc.) aren't slug-routed, so
 * service references are out of scope here — link to those by typing the
 * URL into a regular external link mark, or use a custom mark later.
 */
export default defineType({
  name: "internalLink",
  title: "Internal link",
  type: "object",
  fields: [
    defineField({
      name: "reference",
      title: "Target document",
      type: "reference",
      to: [
        { type: "post" },
        { type: "guide" },
        { type: "caseStudy" },
        { type: "assessment" },
      ],
      validation: (rule) => rule.required(),
    }),
  ],
});
