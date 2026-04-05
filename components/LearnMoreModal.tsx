"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { TopicSlides } from "@/lib/learnMoreSlides";

interface LearnMoreModalProps {
  topic: TopicSlides | null;
  onClose: () => void;
}

export default function LearnMoreModal({ topic, onClose }: LearnMoreModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset slide index when topic changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [topic]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (topic) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [topic]);

  const goTo = useCallback(
    (index: number, dir: "next" | "prev") => {
      if (isAnimating || !topic) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsAnimating(false);
      }, 200);
    },
    [isAnimating, topic]
  );

  const next = useCallback(() => {
    if (!topic) return;
    // Total slides = content slides + 1 CTA slide
    const total = topic.slides.length + 1;
    if (currentSlide < total - 1) goTo(currentSlide + 1, "next");
  }, [currentSlide, topic, goTo]);

  const prev = useCallback(() => {
    if (currentSlide > 0) goTo(currentSlide - 1, "prev");
  }, [currentSlide, goTo]);

  // Keyboard navigation
  useEffect(() => {
    if (!topic) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [topic, onClose, next, prev]);

  if (!topic) return null;

  const totalSlides = topic.slides.length + 1; // +1 for CTA slide
  const isCtaSlide = currentSlide === topic.slides.length;
  const slide = isCtaSlide ? null : topic.slides[currentSlide];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl bg-ecm-green rounded-2xl border border-ecm-lime/20 shadow-2xl shadow-ecm-lime/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-ecm-lime font-barlow font-bold text-lg sm:text-xl truncate">
              {topic.title}
            </h2>
            <p className="text-white/50 text-xs font-barlow mt-0.5">
              {topic.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white flex-shrink-0"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Slide counter */}
        <div className="px-6 sm:px-8 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-ecm-lime/60 text-xs font-barlow font-semibold">
              {currentSlide + 1} / {totalSlides}
            </span>
            {/* Progress bar */}
            <div className="flex-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-ecm-lime/60 rounded-full transition-all duration-300"
                style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Slide content */}
        <div className="px-6 sm:px-8 pb-4 min-h-[300px] sm:min-h-[340px] flex flex-col">
          <div
            className={`flex-1 transition-opacity duration-200 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            {isCtaSlide ? (
              /* CTA slide */
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 bg-ecm-lime/15 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-ecm-lime" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <h3 className="text-ecm-lime font-barlow font-bold text-2xl mb-3">
                  Want to explore this further?
                </h3>
                <p className="text-white/70 text-sm mb-8 max-w-md">
                  We can discuss how this applies to your organisation and design a practical path forward.
                </p>
                <Link
                  href={`/contact?topic=${encodeURIComponent(topic.title)}`}
                  className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold px-10 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors text-sm"
                  onClick={onClose}
                >
                  GET IN TOUCH
                </Link>
              </div>
            ) : slide ? (
              /* Content slide */
              <div className="py-2">
                <h3 className="text-ecm-lime font-barlow font-bold text-xl sm:text-2xl mb-5 leading-tight">
                  {slide.heading}
                </h3>
                {slide.points.length > 0 && (
                  <ul className="space-y-3">
                    {slide.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ecm-lime/50 flex-shrink-0" />
                        <span
                          className={`text-sm leading-relaxed ${
                            point.bold
                              ? "text-white/90 font-semibold"
                              : "text-white/70"
                          }`}
                        >
                          {point.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 sm:px-8 pb-6">
          <button
            onClick={prev}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 text-sm font-barlow font-semibold text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Previous
          </button>

          {/* Dot indicators — show only a window of dots for long decks */}
          <div className="flex gap-1.5 items-center">
            {totalSlides <= 12 ? (
              Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > currentSlide ? "next" : "prev")}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentSlide
                      ? "bg-ecm-lime w-4"
                      : "bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))
            ) : (
              /* For long decks, show abbreviated dots */
              <>
                <span className="text-white/40 text-xs font-barlow">
                  {currentSlide + 1} of {totalSlides}
                </span>
              </>
            )}
          </div>

          <button
            onClick={next}
            disabled={currentSlide === totalSlides - 1}
            className="flex items-center gap-2 text-sm font-barlow font-semibold text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isCtaSlide ? "Next" : currentSlide === totalSlides - 2 ? "Finish" : "Next"}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
