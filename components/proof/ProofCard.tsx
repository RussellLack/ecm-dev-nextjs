import Link from "next/link";
import {
  ENGAGEMENT_LABEL,
  engagementHref,
  type RepresentativeEngagement,
} from "@/lib/representativeEngagements";

/* Card for a representative engagement. Deliberately unlike the named
   case-study cards (solid green, client name, illustration): a light,
   bordered card with an outlined "Representative engagement" badge, the
   client TYPE rather than a name, and no imagery, so it never reads as a
   client case study. Featured: summary plus up to three capability tags.
   Compact: one paragraph. */
export default function ProofCard({
  engagement: e,
  size = "featured",
  theme,
  summary,
}: {
  engagement: RepresentativeEngagement;
  size?: "featured" | "compact";
  /** Optional theme word shown after the badge (homepage: Knowledge...). */
  theme?: string;
  /** Override the default card summary (homepage copy). */
  summary?: string;
}) {
  const featured = size === "featured";
  const text = summary ?? e.cardSummary;
  return (
    <Link
      href={engagementHref(e)}
      className={`group flex flex-col h-full rounded-2xl border border-surface-border bg-surface hover:border-heading/40 hover:shadow-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-heading ${
        featured ? "p-6 sm:p-8" : "p-5 sm:p-6"
      }`}
    >
      <p className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center rounded-full border border-heading/30 px-2.5 py-0.5 text-heading font-barlow font-semibold text-[11px] uppercase tracking-wider">
          {ENGAGEMENT_LABEL}
        </span>
        {theme && (
          <span className="text-heading/70 font-barlow font-semibold text-[11px] uppercase tracking-wider">
            {theme}
          </span>
        )}
      </p>
      <h3
        className={`text-heading font-barlow font-bold leading-snug mb-1 group-hover:underline underline-offset-4 ${
          featured ? "text-xl sm:text-2xl" : "text-lg"
        }`}
      >
        {e.title}
      </h3>
      <p className="text-ink-muted text-xs mb-3">{e.clientType}</p>
      <p className={`text-ink leading-relaxed flex-1 ${featured ? "text-sm sm:text-base" : "text-sm"}`}>
        {text}
      </p>
      {featured && e.capabilities.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mt-4" aria-label="Capabilities">
          {e.capabilities.slice(0, 3).map((c) => (
            <li
              key={c}
              className="inline-flex items-center rounded-full font-barlow text-xs px-2.5 py-1 bg-surface-alt text-ink-muted border border-surface-border"
            >
              {c}
            </li>
          ))}
        </ul>
      )}
      <span className="mt-5 inline-flex items-center gap-1 text-heading font-barlow font-semibold text-sm">
        See the representative engagement <span aria-hidden="true">&rarr;</span>
      </span>
    </Link>
  );
}
