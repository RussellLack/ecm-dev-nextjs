"use client";

import { useState } from "react";
import { useCsrf } from "@/lib/useCsrf";
import { MODEL_VERSION } from "@/lib/estimator/coefficients";
import type {
  EstimatorInputs,
  EstimatorResult,
  FeedbackReaction,
} from "@/lib/estimator/types";

interface Props {
  inputs: EstimatorInputs;
  result: EstimatorResult;
}

export default function FeedbackWidget({ inputs, result }: Props) {
  const { withCsrf } = useCsrf();
  const [reaction, setReaction] = useState<FeedbackReaction | null>(null);
  const [comment, setComment] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showCommentField = reaction === "too_low" || reaction === "too_high";

  async function handleReaction(r: FeedbackReaction) {
    setReaction(r);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: withCsrf({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          modelVersion: MODEL_VERSION,
          inputs,
          computed: { total: result.total, layers: result.layers },
          scenarioShown: "one_level_up_maturity",
          reaction: r,
          _hp: "",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Unknown error");
      }
      setSubmitted(true);
      setToken(data.token ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send feedback");
      setSubmitted(false);
    }
  }

  async function handleCommentBlur() {
    if (!token || !comment.trim()) return;
    try {
      await fetch("/api/feedback", {
        method: "PATCH",
        headers: withCsrf({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          token,
          comment: comment.slice(0, 140),
          _hp: "",
        }),
      });
    } catch {
      // silent — comment is optional
    }
  }

  return (
    <section className="mb-8 border-t border-gray-200 pt-7">
      <p className="mb-3.5 font-barlow text-base text-ecm-gray-dark">
        Does this estimate feel right?
      </p>

      <div className="mb-3 flex flex-wrap gap-2.5">
        {(["too_low", "about_right", "too_high", "not_sure"] as const).map((r) => {
          const active = reaction === r;
          return (
            <button
              key={r}
              type="button"
              disabled={submitted && active}
              onClick={() => handleReaction(r)}
              className={`rounded-full border px-4 py-2 font-barlow text-sm transition-colors ${
                active
                  ? "border-ecm-green bg-ecm-green text-white"
                  : "border-gray-200 bg-white text-ecm-gray-dark hover:border-ecm-green hover:text-ecm-green"
              }`}
            >
              {chipLabels[r]}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-2.5 font-barlow text-sm text-red-600">
          Could not save feedback — {error}
        </div>
      )}

      {submitted && (
        <div className="mt-2.5 font-barlow text-sm text-ecm-green">
          Thanks — your feedback will help refine the next version of the model.
        </div>
      )}

      {showCommentField && submitted && (
        <div className="mt-3.5">
          <input
            type="text"
            maxLength={140}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={handleCommentBlur}
            placeholder="Optional — where did we miss it?"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 font-barlow text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none"
          />
          <div className="mt-1 text-right font-barlow text-[11px] text-ecm-gray">
            {comment.length} / 140
          </div>
        </div>
      )}

      <div className="mt-3.5 font-barlow text-[11px] leading-relaxed text-ecm-gray">
        Your feedback is anonymous. We store your input profile and your reaction to help
        improve the model — nothing that identifies you or your organisation.{" "}
        <a href="/methodology#feedback-loop" className="underline hover:text-ecm-green">
          How we use this.
        </a>
      </div>
    </section>
  );
}

const chipLabels: Record<FeedbackReaction, string> = {
  too_low: "Too low",
  about_right: "About right",
  too_high: "Too high",
  not_sure: "Not sure",
};
