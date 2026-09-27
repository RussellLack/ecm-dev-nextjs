"use client";

import { useEffect, useRef } from "react";
import {
  pushJourneyEvent,
  type JourneyOffer,
  type JourneyPillar,
} from "@/lib/analytics";

/**
 * Invisible marker placed inside an offer panel. Pushes `offer_viewed` the
 * first time the marker scrolls into view, then disconnects, so each panel
 * counts at most once per page view. Renders an empty, zero-size span.
 */
export default function OfferViewTracker({
  offer,
  pillar,
}: {
  offer: JourneyOffer;
  pillar?: JourneyPillar;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          pushJourneyEvent("offer_viewed", { offer, pillar: pillar ?? null });
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [offer, pillar]);

  return <span ref={ref} aria-hidden="true" className="block h-px w-px" />;
}
