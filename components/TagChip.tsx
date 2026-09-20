// Shared tag-chip styling for case studies. Deliberately differentiates
// the 3 pillar tags (the taxonomy: Content Technology, Content Operations,
// Content Localization) from the much larger set of free-text article/topic
// tags (EdTech, SEO, CRM, etc.) stored per case study. Pillars are the
// category, everything else is descriptive metadata, the two should never
// read as the same kind of thing.

// Left as fixed light-palette colors (not theme-aware) rather than
// invented dark-mode variants for a 3-color category code — same
// tradeoff as GitHub-style labels staying constant regardless of theme.
// Revisit if this reads as broken against a dark canvas.
export const PILLAR_TAG_COLORS: Record<string, string> = {
  "Content Localization": "bg-blue-100 text-blue-800",
  "Content Technology": "bg-purple-100 text-purple-800",
  "Content Operations": "bg-green-100 text-green-800",
};

// Maps the `pillars` slug field (technology/services/localization, as
// stored on case studies) to its display title. Cards and the case-study
// hero show only these, derived from `pillars`, not from the free-text
// `tags` field, most case studies carry a pillars value without a
// matching literal string in tags.
export const PILLAR_SLUG_TITLE: Record<string, string> = {
  technology: "Content Technology",
  services: "Content Operations",
  localization: "Content Localization",
};

export function isPillarTag(tag: string): boolean {
  return tag in PILLAR_TAG_COLORS;
}

export function PillarTags({ pillars }: { pillars?: string[] }) {
  if (!pillars?.length) return null;
  const titles = pillars
    .map((slug) => PILLAR_SLUG_TITLE[slug])
    .filter((title): title is string => Boolean(title));
  if (!titles.length) return null;
  return (
    <>
      {titles.map((title) => (
        <TagChip key={title} tag={title} />
      ))}
    </>
  );
}

export function TagChip({ tag }: { tag: string }) {
  if (isPillarTag(tag)) {
    return (
      <span
        className={`${PILLAR_TAG_COLORS[tag]} inline-flex items-center rounded-full font-barlow font-semibold uppercase tracking-wide text-[11px] px-3 py-1`}
      >
        {tag}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full font-barlow font-medium text-xs px-2.5 py-1 bg-surface-alt text-ink-muted border border-surface-border">
      {tag}
    </span>
  );
}
