/**
 * Homepage "field notes": short observations shown one at a time, replacing
 * the scrolling ticker. Each note starts from something observable, names
 * the mechanism beneath it, and links to the page that develops the point,
 * so the note is a doorway rather than a slogan.
 *
 * Voice: ECM.dev Voice DNA (serious noticing, institutional reframing,
 * restrained wit aimed at institutions, never at the people working around
 * them). No invented statistics, clients or quotes. No em or en dashes.
 *
 * Code-owned rather than Sanity-sourced for now, like the other homepage
 * positioning copy: see docs/COMMERCIAL-JOURNEY-2026-09-27.md.
 */

export type FieldNote = {
  text: string;
  href: string;
  linkLabel: string;
};

export const FIELD_NOTES: FieldNote[] = [
  {
    text: "Almost every CMS has a field for the content owner. It is usually empty, because filling it in would turn a shared responsibility into a named one.",
    href: "/problems/our-teams-work-in-silos",
    linkLabel: "When nobody owns the content",
  },
  {
    text: "The spreadsheet kept beside a new platform is rarely resistance. More often it holds the part of the work the platform was never set up to know about.",
    href: "/problems/our-cms-isnt-creating-value",
    linkLabel: "When the CMS is not the problem",
  },
  {
    text: "An AI assistant will not decide which of your three returns policies is current. It will quote whichever one it finds first, and sound sure about it.",
    href: "/problems/ai-isnt-delivering",
    linkLabel: "Why AI repeats what it finds",
  },
  {
    text: "Publishing is seldom slow because people write slowly. The content waits, usually in an inbox, for someone with the authority to say yes.",
    href: "/problems/marketing-takes-too-long",
    linkLabel: "Where publishing time goes",
  },
  {
    text: "Translators are often the first to find an unclear source sentence, because nobody can translate what nobody can explain. The fix belongs upstream. The cost lands in every language.",
    href: "/problems/localisation-costs-keep-growing",
    linkLabel: "Why each market costs as much as the last",
  },
  {
    text: "A migration moves the content. It also moves every unresolved decision about that content, which now sits on a newer platform.",
    href: "/briefings/the-hidden-cost-of-content-chaos",
    linkLabel: "The cost of carrying it forward",
  },
  {
    text: "The single source of truth is often single mainly on the architecture diagram. In practice, each department still trusts its own version.",
    href: "/briefings/content-infrastructure-explained",
    linkLabel: "What content infrastructure means",
  },
  {
    text: "The pilot worked because it had clean content, senior attention and none of the exceptions found in live operations. Scaling it means meeting those exceptions for the first time.",
    href: "/briefings/why-ai-projects-fail",
    linkLabel: "Why AI pilots stall",
  },
  {
    text: "Undated guidance looks current to a customer and to a machine alike. Old content stays live when retiring it is nobody's job.",
    href: "/content-audit/sample",
    linkLabel: "How a Snapshot finds this",
  },
];
