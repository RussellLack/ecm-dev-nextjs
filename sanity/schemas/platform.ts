import { defineType, defineField } from "sanity";
import { PILLAR_OPTIONS } from "./taxonomyOptions";

/**
 * Editorial platform page (/platforms/<slug>).
 *
 * One document per CMS / DAM / DXP / AI vendor that ECM.DEV has a
 * documented point of view on. These pages compete for `<vendor>
 * consultancy / partner` search intent and act as evergreen anchors
 * for the (ephemeral) intel feed.
 *
 * The detail-page renderer auto-pulls related guides / posts / case
 * studies that share `tagAliases` so the page is useful even when
 * `body` is sparse.
 */
export default defineType({
  name: "platform",
  title: "Platform",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Platform name",
      type: "string",
      description:
        "Canonical product name as users would search for it (e.g. 'Sitecore', 'Sanity', 'Kentico Xperience').",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "CMS", value: "CMS" },
          { title: "DAM", value: "DAM" },
          { title: "PIM", value: "PIM" },
          { title: "DXP", value: "DXP" },
          { title: "AI", value: "AI" },
          { title: "Analytics", value: "Analytics" },
          { title: "Other", value: "Other" },
        ],
      },
    }),
    defineField({
      name: "summary",
      title: "Summary",
      description:
        "One-sentence positioning. Shown on the /platforms index card.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroDescription",
      title: "Hero description",
      description: "Body paragraph shown below the hero on the detail page.",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "pillars",
      title: "Service pillars",
      description:
        "Which service pillar(s) this platform falls under. Drives cross-linking from /content-technology, /content-services, /content-localization.",
      type: "array",
      of: [{ type: "string" }],
      options: { list: [...PILLAR_OPTIONS] },
    }),
    defineField({
      name: "tagAliases",
      title: "Tag aliases",
      description:
        "Tag strings used on posts/guides/case studies that refer to this platform (e.g. 'Sitecore XM Cloud', 'Sitecore Symposium'). Anything tagged with these will auto-surface on the platform detail page.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "intelVendorSlug",
      title: "Intel vendor slug",
      description:
        "Optional: slug of the matching intelVendor (in the ecm-dev-intel project) so the page can link to /intel/vendor/<slug>.",
      type: "string",
    }),
    defineField({
      name: "website",
      title: "Vendor website",
      type: "url",
      validation: (rule) =>
        rule.uri({ scheme: ["http", "https"], allowRelative: false }),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          marks: {
            annotations: [
              { type: "internalLink" },
              {
                name: "link",
                type: "object",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    validation: (rule: any) =>
                      rule.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                        allowRelative: false,
                      }),
                  },
                ],
              },
            ],
          },
        },
        { type: "image", options: { hotspot: true } },
      ],
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first on the /platforms index.",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "category", media: "logo" },
  },
});
