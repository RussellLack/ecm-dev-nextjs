"use client";

import { useState } from "react";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  commentary?: string;
}

export default function TestimonialsClient({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () =>
    setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const t = testimonials[current];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-ecm-green font-barlow text-sm font-medium mb-2">
          {t.name}
        </p>
        <p className="text-ecm-gray text-sm mb-8">{t.role}</p>
        <blockquote className="text-ecm-green font-barlow font-medium text-xl lg:text-2xl mb-6 leading-relaxed">
          {t.quote}
        </blockquote>
        <p className="text-ecm-gray-dark text-sm leading-relaxed max-w-2xl mx-auto mb-10">
          <span className="font-semibold">Why this matters:</span>{" "}
          {t.commentary}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border-2 border-ecm-green text-ecm-green hover:bg-ecm-green hover:text-white transition-colors flex items-center justify-center"
            aria-label="Previous testimonial"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === current ? "bg-ecm-green" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full border-2 border-ecm-green text-ecm-green hover:bg-ecm-green hover:text-white transition-colors flex items-center justify-center"
            aria-label="Next testimonial"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
