"use client";

import { useState } from "react";
import LearnMoreModal from "./LearnMoreModal";
import { topicSlides, type TopicSlides } from "@/lib/learnMoreSlides";

interface LearnMoreItem {
  title: string;
  subtitle: string;
}

interface LearnMoreSectionProps {
  items: LearnMoreItem[];
}

export default function LearnMoreSection({ items }: LearnMoreSectionProps) {
  const [activeTopic, setActiveTopic] = useState<TopicSlides | null>(null);

  function handleCardClick(item: LearnMoreItem) {
    // Match the clicked card to the topic slides data
    const match = topicSlides.find(
      (t) => t.title.toLowerCase() === item.title.toLowerCase()
    );
    if (match) {
      setActiveTopic(match);
    }
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, i) => {
          const hasSlides = topicSlides.some(
            (t) => t.title.toLowerCase() === item.title.toLowerCase()
          );
          return (
            <button
              key={i}
              onClick={() => handleCardClick(item)}
              className="bg-ecm-green rounded-xl p-6 border border-ecm-lime/15 hover:border-ecm-lime/40 transition-all group hover:shadow-lg hover:shadow-ecm-lime/5 text-left"
            >
              <h3 className="text-ecm-lime font-barlow font-semibold text-base mb-2">
                {item.title}
              </h3>
              <p className="text-white/60 text-sm mb-4">{item.subtitle}</p>
              <span className="inline-block bg-ecm-lime text-ecm-green text-xs font-barlow font-semibold px-4 py-2 rounded-full group-hover:bg-ecm-lime-hover transition-colors">
                {hasSlides ? "READ MORE" : "LEARN MORE"}
              </span>
            </button>
          );
        })}
      </div>

      <LearnMoreModal
        topic={activeTopic}
        onClose={() => setActiveTopic(null)}
      />
    </>
  );
}
