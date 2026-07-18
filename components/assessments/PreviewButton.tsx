"use client";

import { useCallback, useEffect, useState } from "react";
import { pushGateEvent } from "@/lib/analytics";

interface Props {
  /** Assessment slug/id — used for the analytics event. */
  slug: string;
  /** Human label shown in the lightbox caption. */
  title: string;
  /** Public path to the demo video, e.g. "/assessment-previews/process.mp4". */
  src: string;
  /** Short duration label shown on the button, e.g. "71s". */
  durationLabel?: string;
}

/**
 * A low-key "Preview" button that opens the assessment's demo video full-bleed
 * in a lightbox. Keeps the listing page clean — nothing plays until clicked.
 * Silent screencasts, so the player is muted + looped by default.
 */
export default function PreviewButton({
  slug,
  title,
  src,
  durationLabel,
}: Props) {
  const [open, setOpen] = useState(false);

  const openPreview = useCallback(() => {
    setOpen(true);
    pushGateEvent("assessment_preview", { tool_name: slug });
  }, [slug]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className="inline-flex items-center gap-2 rounded-full border border-ecm-green/30 bg-white px-6 py-3 font-barlow text-sm font-semibold text-ecm-green transition-colors hover:border-ecm-green hover:bg-ecm-lime/15"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        Preview{durationLabel ? ` (${durationLabel})` : ""}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} preview`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[rgba(9,18,13,0.92)] p-5 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-[1240px] overflow-hidden rounded-2xl shadow-2xl">
            <button
              type="button"
              onClick={close}
              aria-label="Close preview"
              className="absolute right-3.5 top-3.5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(9,18,13,0.5)] text-xl text-white backdrop-blur-sm transition-colors hover:bg-[rgba(9,18,13,0.85)]"
            >
              &times;
            </button>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={src}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="block aspect-video w-full bg-black"
            />
          </div>
          <p className="font-barlow text-sm font-medium text-white/85">
            {title} — preview
          </p>
        </div>
      )}
    </>
  );
}
