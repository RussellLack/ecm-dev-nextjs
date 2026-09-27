"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FIELD_NOTES } from "@/lib/fieldNotes";

/**
 * One field note at a time, still and readable, replacing the scrolling
 * ticker (which had no pause control and ignored reduced-motion settings).
 * The server renders the first note so the markup is stable for hydration;
 * after mount a random note is chosen, so repeat visitors see a different
 * one. "Another note" steps through the rest, and only then does the
 * region become aria-live, so screen readers announce requested changes.
 */
export default function FieldNote() {
  const [index, setIndex] = useState(0);
  // Announce changes only once the visitor asks for one, not on the
  // random pick after mount.
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * FIELD_NOTES.length));
  }, []);

  const note = FIELD_NOTES[index];

  return (
    <section aria-labelledby="field-note-label" className="bg-ecm-green pb-16 sm:pb-20">
      {/* Wave divider: white → green, in normal flow. */}
      <div aria-hidden="true" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "auto" }}>
          <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="var(--color-surface)" />
        </svg>
      </div>
      <div className="max-w-3xl mx-auto px-6 pt-8 sm:pt-10">
        <p
          id="field-note-label"
          className="text-ecm-lime/70 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-6"
        >
          Field note
        </p>
        <div aria-live={asked ? "polite" : "off"}>
          <blockquote className="text-ecm-lime font-barlow font-semibold text-2xl sm:text-3xl leading-snug mb-8">
            {note.text}
          </blockquote>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={note.href}
              className="inline-flex items-center gap-1 text-white font-barlow font-semibold text-sm underline underline-offset-4 hover:text-ecm-lime"
            >
              {note.linkLabel} <span aria-hidden="true">&rarr;</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setAsked(true);
                setIndex((i) => (i + 1) % FIELD_NOTES.length);
              }}
              className="inline-flex items-center rounded-full border border-ecm-lime/40 px-4 py-2 text-ecm-lime font-barlow font-semibold text-sm hover:bg-ecm-lime hover:text-ecm-green transition-colors"
            >
              Another note
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
