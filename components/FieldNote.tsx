"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { FieldNote as FieldNoteType } from "@/lib/fieldNotes";

/** How long each note stays on screen before the next fades in. */
const DWELL_MS = 9000;

/**
 * One field note at a time, rotating on its own with a slow crossfade.
 *
 * All notes are stacked in the same grid cell, so the block is as tall as
 * the longest note and nothing below it moves when the note changes. Only
 * the visible note is exposed: the rest are `inert` (no focus, no clicks)
 * and hidden from assistive technology. The region is not aria-live, so
 * screen readers are not interrupted by changes nobody asked for.
 *
 * Rotation pauses while the pointer is over the note or focus is inside it
 * (so a visitor can read and follow the link), while the section is off
 * screen and while the tab is hidden. With reduced motion requested it does
 * not rotate at all: the visitor sees one note, chosen at random.
 *
 * The server renders the first note so hydration is stable; after mount a
 * random starting note is picked, so repeat visitors see a different one.
 */
export default function FieldNote({ notes }: { notes: FieldNoteType[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * notes.length));

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(motion.matches);
    onMotion();
    motion.addEventListener("change", onMotion);

    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    let observer: IntersectionObserver | undefined;
    if (sectionRef.current && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => setOnScreen(entry.isIntersecting),
        { threshold: 0.3 },
      );
      observer.observe(sectionRef.current);
    } else {
      setOnScreen(true);
    }

    return () => {
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, [notes.length]);

  const rotating =
    notes.length > 1 && !reducedMotion && onScreen && tabVisible && !hovered && !focused;

  useEffect(() => {
    if (!rotating) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % notes.length), DWELL_MS);
    return () => window.clearTimeout(t);
  }, [rotating, index, notes.length]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="field-note-label"
      className="bg-ecm-green pb-16 sm:pb-20"
    >
      {/* Wave divider: white → green, in normal flow. */}
      <div aria-hidden="true" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "auto" }}>
          <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="var(--color-surface)" />
        </svg>
      </div>
      <div className="max-w-3xl mx-auto px-6 pt-8 sm:pt-10">
        <p
          id="field-note-label"
          className="text-ecm-lime/90 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-6"
        >
          Field note
        </p>
        <div
          className="grid"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
          }}
        >
          {notes.map((note, i) => {
            const active = i === index;
            return (
              <div
                key={note.href + i}
                aria-hidden={!active}
                inert={!active}
                className={`[grid-area:1/1] transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
                  active ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <blockquote className="text-ecm-lime font-barlow font-semibold text-2xl sm:text-3xl leading-snug mb-8">
                  {note.text}
                </blockquote>
                <Link
                  href={note.href}
                  className="inline-flex items-center gap-1 text-white font-barlow font-semibold text-sm underline underline-offset-4 hover:text-ecm-lime"
                >
                  {note.linkLabel} <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
