"use client";

import type { SanityQuestion } from "@/lib/assessment/types";

interface QuestionRendererProps {
  question: SanityQuestion;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
}

export default function QuestionRenderer({
  question,
  selectedOptionId,
  onSelect,
}: QuestionRendererProps) {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-white font-barlow font-bold text-xl sm:text-2xl lg:text-3xl mb-3 leading-snug">
        {question.text}
      </h2>

      {question.helpText && (
        <p className="text-white/50 font-barlow text-sm mb-8">{question.helpText}</p>
      )}

      <div className="space-y-3 mt-8">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.optionId;
          return (
            <button
              key={option.optionId}
              onClick={() => onSelect(option.optionId)}
              className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 font-barlow ${
                isSelected
                  ? "border-ecm-lime bg-ecm-lime/10 text-ecm-lime"
                  : "border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-5 h-5 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    isSelected ? "border-ecm-lime bg-ecm-lime" : "border-white/30"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 bg-ecm-green rounded-full" />
                  )}
                </div>
                <span className="text-sm sm:text-base">{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
