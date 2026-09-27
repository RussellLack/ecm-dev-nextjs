"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import {
  pushJourneyEvent,
  type JourneyEventName,
  type JourneyEventParams,
} from "@/lib/analytics";

/**
 * next/link that pushes a commercial journey event on click. Lets server
 * components (homepage cards) record a click without becoming client
 * components themselves. Navigation is never delayed or blocked.
 */
export default function TrackedLink({
  event,
  params,
  onClick,
  ...linkProps
}: ComponentProps<typeof Link> & {
  event: JourneyEventName;
  params: Partial<JourneyEventParams>;
}) {
  return (
    <Link
      {...linkProps}
      onClick={(e) => {
        pushJourneyEvent(event, params);
        onClick?.(e);
      }}
    />
  );
}
