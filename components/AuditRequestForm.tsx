"use client";

/**
 * Signup form for the paid AI Content Readiness Audit (homepage strip).
 *
 * Submission path mirrors ContactForm exactly: React form -> POST
 * /api/audit-request -> guardSubmission (CSRF + honeypot + rate limit) ->
 * server forwards to Netlify Forms. Field names must stay in sync with
 * app/api/audit-request/route.ts and public/__forms.html.
 */

import { useState } from "react";
import { useCsrf } from "@/lib/useCsrf";
import { pushLeadEvent, LEAD_TYPE, TOOL_NAME } from "@/lib/analytics";

const FIELD_CLASS =
  "w-full bg-transparent border-b border-white/60 text-white text-sm py-1.5 focus:border-ecm-lime outline-none transition-colors";
const LABEL_CLASS = "block text-white/70 text-xs font-barlow font-semibold uppercase tracking-wide mb-1";

export default function AuditRequestForm({
  intro,
  submitLabel,
  confirmation,
}: {
  intro: string;
  submitLabel: string;
  confirmation: string;
}) {
  const { withCsrf } = useCsrf();
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    company: "",
    websiteUrl: "",
    notes: "",
  });
  const [hp, setHp] = useState(""); // honeypot, should stay empty
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/audit-request", {
        method: "POST",
        credentials: "same-origin",
        headers: withCsrf({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ...formData, _hp: hp }),
      });

      if (!res.ok) throw new Error("Failed to send");

      setStatus("sent");

      // An audit request is a confirmed conversion, same weight as the
      // contact form: it puts a named buyer in front of a paid engagement.
      pushLeadEvent("close_convert_lead", {
        tool_name: TOOL_NAME.auditRequest,
        lead_type: LEAD_TYPE.bookedCall,
      });
      setFormData({ fullName: "", workEmail: "", company: "", websiteUrl: "", notes: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-ecm-lime/30 bg-white/10 backdrop-blur p-8"
      >
        <p className="text-ecm-lime font-barlow font-semibold text-lg">{confirmation}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-white/70 text-xs leading-relaxed">{intro}</p>

      {/* Honeypot, hidden from real users, visible to bots */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
      >
        <label>
          Leave this field empty
          <input
            type="text"
            name="_hp"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
        </label>
      </div>

      {/* Two fields per row from sm up: halves the field stack's height
          without cramming labels or inputs. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div>
          <label htmlFor="audit-full-name" className={LABEL_CLASS}>Full name *</label>
          <input
            id="audit-full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className={`${FIELD_CLASS} placeholder:text-white/30`}
          />
        </div>

        <div>
          <label htmlFor="audit-work-email" className={LABEL_CLASS}>Work email *</label>
          <input
            id="audit-work-email"
            name="workEmail"
            type="email"
            autoComplete="email"
            placeholder="jane@company.com"
            required
            value={formData.workEmail}
            onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
            className={`${FIELD_CLASS} placeholder:text-white/30`}
          />
        </div>

        <div>
          <label htmlFor="audit-company" className={LABEL_CLASS}>Company *</label>
          <input
            id="audit-company"
            name="company"
            type="text"
            autoComplete="organization"
            required
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="audit-website-url" className={LABEL_CLASS}>Website URL *</label>
          <input
            id="audit-website-url"
            name="websiteUrl"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="company.com"
            required
            value={formData.websiteUrl}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            className={`${FIELD_CLASS} placeholder:text-white/30`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="audit-notes" className={LABEL_CLASS}>Anything we should know</label>
        <textarea
          id="audit-notes"
          name="notes"
          rows={2}
          placeholder="e.g. which markets, which CMS, what prompted this"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className={`${FIELD_CLASS} resize-none placeholder:text-white/30`}
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-ecm-lime text-ecm-green font-barlow font-semibold py-3 rounded-full hover:bg-ecm-lime-hover transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : submitLabel}
      </button>

      {status === "error" && (
        <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
