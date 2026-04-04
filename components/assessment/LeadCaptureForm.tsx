"use client";

import { useState } from "react";
import type { ContactInfo } from "@/lib/assessment/types";

interface LeadCaptureFormProps {
  onSubmit: (contact: ContactInfo, requestedContact: boolean) => void;
  isSubmitting: boolean;
}

export default function LeadCaptureForm({ onSubmit, isSubmitting }: LeadCaptureFormProps) {
  const [form, setForm] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
  });
  const [requestedContact, setRequestedContact] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.company.trim()) errs.company = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form, requestedContact);
  }

  function field(
    name: keyof ContactInfo,
    label: string,
    required = false,
    type = "text"
  ) {
    return (
      <div>
        <label className="block text-white/70 font-barlow text-sm mb-1">
          {label} {required && <span className="text-ecm-lime">*</span>}
        </label>
        <input
          type={type}
          value={form[name] || ""}
          onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
          className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
            errors[name] ? "border-red-400" : "border-white/15"
          } text-white font-barlow placeholder-white/30 focus:outline-none focus:border-ecm-lime transition-colors`}
          placeholder={label}
        />
        {errors[name] && (
          <p className="text-red-400 text-xs mt-1 font-barlow">{errors[name]}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fadeIn">
      <h2 className="text-white font-barlow font-bold text-xl sm:text-2xl lg:text-3xl mb-2">
        Almost there.
      </h2>
      <p className="text-white/50 font-barlow text-sm mb-8">
        Enter your details to see your personalised maturity report.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {field("firstName", "First name", true)}
        {field("lastName", "Last name", true)}
        {field("email", "Work email", true, "email")}
        {field("company", "Company", true)}
        {field("role", "Role / Title")}
      </div>

      <label className="flex items-start gap-3 mb-8 cursor-pointer group">
        <input
          type="checkbox"
          checked={requestedContact}
          onChange={(e) => setRequestedContact(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 accent-ecm-lime"
        />
        <span className="text-white/60 font-barlow text-sm group-hover:text-white/80 transition-colors">
          I'd like someone from ECM.dev to walk me through the results
        </span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto bg-ecm-lime text-ecm-green font-barlow font-bold text-lg px-12 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Calculating your results..." : "See my results"}
      </button>
    </form>
  );
}
