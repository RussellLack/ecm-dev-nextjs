// Shared tag-chip styling for case studies. Deliberately differentiates
// the 3 pillar tags (the taxonomy: Content Technology, Content Operations,
// Content Localization) from the much larger set of free-text article/topic
// tags (EdTech, SEO, CRM, etc.) stored per case study. Pillars are the
// category, everything else is descriptive metadata, the two should never
// read as the same kind of thing.

export const PILLAR_TAG_COLORS: Record<string, string> = {
  "Content Localization": "bg-blue-100 text-blue-800",
  "Content Technology": "bg-purple-100 text-purple-800",
  "Content Operations": "bg-green-100 text-green-800",
};

export function isPillarTag(tag: string): boolean {
  return tag in PILLAR_TAG_COLORS;
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
    <span className="inline-flex items-center rounded-full font-barlow font-medium text-xs px-2.5 py-1 bg-gray-100 text-gray-600 border border-gray-200">
      {tag}
    </span>
  );
}
