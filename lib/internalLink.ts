// Resolve a Sanity reference to an internal route. Used by the
// `internalLink` Portable Text annotation renderer. Returns null when
// the reference can't be resolved (target deleted, missing slug, or an
// unsupported _type) so the renderer can fall back to plain text rather
// than emitting a broken link.

export type InternalLinkTarget = {
  _id?: string;
  _type?: string;
  slug?: string | null;
  title?: string | null;
} | null
  | undefined;

const TYPE_TO_PREFIX: Record<string, string> = {
  post: "/post",
  guide: "/guide",
  caseStudy: "/case-study",
  assessment: "/assessment",
};

export function internalLinkHref(target: InternalLinkTarget): string | null {
  if (!target?._type || !target.slug) return null;
  const prefix = TYPE_TO_PREFIX[target._type];
  if (!prefix) return null;
  return `${prefix}/${target.slug}`;
}
