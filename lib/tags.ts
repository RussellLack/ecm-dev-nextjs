// Tag <-> URL slug helpers. Tags are stored as free-form strings in Sanity
// (e.g. "Content Operations") but rendered into stable, lowercase URL slugs
// for /blog/tag/<slug> and /guides/tag/<slug> archive pages.

export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Find the original tag string given a slug and a list of candidate tags.
// Used by tag archive routes to recover the canonical tag for filtering.
export function tagFromSlug(slug: string, allTags: string[]): string | null {
  return allTags.find((t) => tagToSlug(t) === slug) ?? null;
}
