/**
 * Shared state for the Content Audit's time-bound introductory offer.
 *
 * Previously the homepage's audit strip computed this itself and the
 * `ContentAuditTiers` pricing block (shown on all three pillar pages) had no
 * equivalent check, so a visitor could read "free before 30 September" on
 * the homepage, then land on /content-technology and see paid pricing with
 * no mention of the offer at all. Both surfaces now read from here.
 *
 * Compared at render time; pages carry `revalidate = 3600`, so the switch to
 * paid framing lands within an hour of the cutoff rather than on the stroke
 * of it.
 */
export const AUDIT_OFFER_ENDS = Date.UTC(2026, 9, 1); // 00:00 UTC, 1 October 2026

export function isAuditOfferOpen(): boolean {
  return Date.now() < AUDIT_OFFER_ENDS;
}
