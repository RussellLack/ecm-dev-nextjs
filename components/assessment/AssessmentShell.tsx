"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "./ProgressBar";
import QuestionRenderer from "./QuestionRenderer";
import { useCsrf } from "@/lib/useCsrf";
import type {
  SanityAssessment,
  SanityQuestion,
  AnswerEntry,
  TrackingData,
} from "@/lib/assessment/types";

interface AssessmentShellProps {
  assessment: SanityAssessment;
}

type Step =
  | { type: "intro" }
  | { type: "question"; sectionIndex: number; questionIndex: number };

export default function AssessmentShell({ assessment }: AssessmentShellProps) {
  const router = useRouter();
  const { withCsrf } = useCsrf();
  const [step, setStep] = useState<Step>({ type: "intro" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(() => Date.now());

  // Flatten all questions with their section context
  const flatQuestions = useMemo(() => {
    const result: Array<{
      question: SanityQuestion;
      sectionIndex: number;
      sectionTitle: string;
    }> = [];
    for (let si = 0; si < assessment.sections.length; si++) {
      const section = assessment.sections[si];
      for (const question of section.questions) {
        result.push({
          question,
          sectionIndex: si,
          sectionTitle: section.title,
        });
      }
    }
    return result;
  }, [assessment]);

  // Filter out conditional questions that shouldn't be shown
  const visibleQuestions = useMemo(() => {
    return flatQuestions.filter(({ question }) => {
      if (!question.conditionalOn) return true;
      const { questionId, optionId } = question.conditionalOn;
      return answers[questionId] === optionId;
    });
  }, [flatQuestions, answers]);

  const totalQuestions = visibleQuestions.length;

  // Current question index within visible questions
  const currentQuestionIndex = useMemo(() => {
    if (step.type !== "question") return -1;
    const currentQ = assessment.sections[step.sectionIndex]?.questions[step.questionIndex];
    if (!currentQ) return -1;
    return visibleQuestions.findIndex(
      (vq) => vq.question.questionId === currentQ.questionId
    );
  }, [step, assessment, visibleQuestions]);

  const currentVisible = currentQuestionIndex >= 0 ? visibleQuestions[currentQuestionIndex] : null;

  // Capture UTM params from URL on mount
  const [tracking, setTracking] = useState<TrackingData>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setTracking({
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
      utmContent: params.get("utm_content") || undefined,
      utmTerm: params.get("utm_term") || undefined,
      referrer: document.referrer || undefined,
      landingPage: window.location.pathname,
    });
  }, []);

  // Submit assessment anonymously
  const submitAssessment = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    const answerEntries: AnswerEntry[] = Object.entries(answers).map(
      ([questionId, optionId]) => ({ questionId, optionId })
    );

    const timeToComplete = Math.round((Date.now() - startTime) / 1000);

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        credentials: "same-origin",
        headers: withCsrf({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          assessmentId: assessment.slug.current,
          answers: answerEntries,
          tracking,
          timeToCompleteSeconds: timeToComplete,
          _hp: "",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }

      const result = await res.json();
      router.push(
        `/assessment/${assessment.slug.current}/results?sid=${result.submissionId}`
      );
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }, [answers, assessment, tracking, startTime, router, withCsrf]);

  // Navigate to next visible question or auto-submit
  const goNext = useCallback(() => {
    if (step.type === "intro") {
      if (visibleQuestions.length > 0) {
        const first = visibleQuestions[0];
        setStep({
          type: "question",
          sectionIndex: first.sectionIndex,
          questionIndex: assessment.sections[first.sectionIndex].questions.indexOf(
            first.question
          ),
        });
      }
      return;
    }

    if (step.type === "question" && currentQuestionIndex >= 0) {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < visibleQuestions.length) {
        const next = visibleQuestions[nextIndex];
        setStep({
          type: "question",
          sectionIndex: next.sectionIndex,
          questionIndex: assessment.sections[next.sectionIndex].questions.indexOf(
            next.question
          ),
        });
      } else {
        // Last question answered — submit automatically
        submitAssessment();
      }
    }
  }, [step, currentQuestionIndex, visibleQuestions, assessment, submitAssessment]);

  // Navigate to previous visible question
  const goBack = useCallback(() => {
    if (step.type === "question" && currentQuestionIndex > 0) {
      const prev = visibleQuestions[currentQuestionIndex - 1];
      setStep({
        type: "question",
        sectionIndex: prev.sectionIndex,
        questionIndex: assessment.sections[prev.sectionIndex].questions.indexOf(
          prev.question
        ),
      });
    } else if (step.type === "question" && currentQuestionIndex === 0) {
      setStep({ type: "intro" });
    }
  }, [step, currentQuestionIndex, visibleQuestions, assessment]);

  // Handle answer selection — auto-advance after a short delay
  function handleSelect(optionId: string) {
    if (!currentVisible) return;
    const qId = currentVisible.question.questionId;
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
    // Auto-advance after 400ms for single-select
    if (currentVisible.question.inputType === "single") {
      setTimeout(() => goNext(), 400);
    }
  }

  // Detect if we're entering a new section (for section intro display)
  const isNewSection = useMemo(() => {
    if (step.type !== "question" || currentQuestionIndex <= 0) return false;
    const prev = visibleQuestions[currentQuestionIndex - 1];
    return prev && prev.sectionIndex !== currentVisible?.sectionIndex;
  }, [step, currentQuestionIndex, visibleQuestions, currentVisible]);

  return (
    <div className="min-h-screen bg-ecm-green">
      <div className="max-w-2xl mx-auto px-6 py-12 sm:py-20">
        {/* ─── Intro Screen ─── */}
        {step.type === "intro" && (
          <div className="animate-fadeIn">
            <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight">
              {assessment.title}
            </h1>
            {assessment.subtitle && (
              <p className="text-white/80 font-barlow text-lg mb-6">
                {assessment.subtitle}
              </p>
            )}
            {assessment.introText && (
              <p className="text-white/60 font-barlow text-base leading-relaxed mb-8">
                {assessment.introText}
              </p>
            )}
            <div className="flex items-center gap-4 mb-10">
              {assessment.estimatedMinutes && (
                <div className="flex items-center gap-2 text-white/40 font-barlow text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {assessment.estimatedMinutes} minutes
                </div>
              )}
              <div className="flex items-center gap-2 text-white/40 font-barlow text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
                {totalQuestions} questions
              </div>
            </div>
            <button
              onClick={goNext}
              className="bg-ecm-lime text-ecm-green font-barlow font-bold text-lg px-10 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors mb-4"
            >
              Start Assessment
            </button>
            <p className="text-white/30 font-barlow text-xs max-w-md">
              No sign-up required. Your responses are processed in accordance with GDPR and never shared with third parties.
            </p>
          </div>
        )}

        {/* ─── Question Screen ─── */}
        {step.type === "question" && currentVisible && !isSubmitting && (
          <>
            <ProgressBar
              current={currentQuestionIndex + 1}
              total={totalQuestions}
              sectionTitle={currentVisible.sectionTitle}
            />

            {/* Section intro card — shown when entering a new section */}
            {isNewSection && (
              <div className="mb-6 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-ecm-lime font-barlow font-semibold text-sm">
                  {assessment.sections[currentVisible.sectionIndex].title}
                </p>
                {assessment.sections[currentVisible.sectionIndex].description && (
                  <p className="text-white/40 font-barlow text-xs mt-1">
                    {assessment.sections[currentVisible.sectionIndex].description}
                  </p>
                )}
              </div>
            )}

            <QuestionRenderer
              question={currentVisible.question}
              selectedOptionId={answers[currentVisible.question.questionId] || null}
              onSelect={handleSelect}
            />

            <div className="flex items-center justify-between mt-10">
              <button
                onClick={goBack}
                className="text-white/40 font-barlow text-sm hover:text-white/70 transition-colors"
              >
                &larr; Back
              </button>
              {answers[currentVisible.question.questionId] && (
                <button
                  onClick={goNext}
                  className="bg-ecm-lime/20 text-ecm-lime font-barlow font-semibold text-sm px-6 py-2 rounded-full hover:bg-ecm-lime/30 transition-colors"
                >
                  {currentQuestionIndex === totalQuestions - 1 ? "See results" : "Next"} &rarr;
                </button>
              )}
            </div>
          </>
        )}

        {/* ─── Submitting Screen ─── */}
        {isSubmitting && (
          <div className="animate-fadeIn text-center py-20">
            <div className="inline-block w-10 h-10 border-2 border-ecm-lime/30 border-t-ecm-lime rounded-full animate-spin mb-6" />
            <p className="text-white font-barlow text-lg">
              Calculating your results...
            </p>
          </div>
        )}

        {/* ─── Error State ─── */}
        {error && !isSubmitting && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
            <p className="text-red-400 font-barlow text-sm">{error}</p>
            <button
              onClick={submitAssessment}
              className="mt-3 text-ecm-lime font-barlow text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
