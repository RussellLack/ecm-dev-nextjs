"use client";

import { useEffect, useState } from "react";
import { useCsrf } from "@/lib/useCsrf";
import {
  pushLeadEvent,
  pushJourneyEvent,
  referringToolName,
  LEAD_TYPE,
  JOURNEY_OFFER,
  type JourneyOffer,
} from "@/lib/analytics";
import {
  ENQUIRY_TOPICS,
  PILLAR_LABEL,
  isEnquiryTopic,
  isPillar,
} from "@/lib/offers";

/** Where the visitor came from, as a short human-readable label, so the
 * enquiry keeps the offer they were looking at and they don't have to
 * restate it. `offer` and `pillar` are matched against fixed lists in
 * lib/offers.ts; the older free-text `service` / `topic` params (package and
 * explainer titles from our own links) are length-capped. Nothing the
 * visitor types is ever put into a URL. */
function readEnquiryContext(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const offer = params.get("offer");
  const pillar = params.get("pillar");
  const parts: string[] = [];
  if (isEnquiryTopic(offer)) parts.push(ENQUIRY_TOPICS[offer]);
  const legacy = (params.get("service") || params.get("topic") || "").trim();
  if (!parts.length && legacy) parts.push(legacy.slice(0, 80));
  if (isPillar(pillar)) parts.push(PILLAR_LABEL[pillar]);
  return parts.join(" · ");
}

export default function ContactForm() {
  const { withCsrf } = useCsrf();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [context, setContext] = useState("");
  const [hp, setHp] = useState(""); // honeypot — should stay empty

  useEffect(() => {
    setContext(readEnquiryContext());
  }, []);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        credentials: "same-origin",
        headers: withCsrf({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ...formData, enquiryContext: context, _hp: hp }),
      });

      if (!res.ok) throw new Error("Failed to send");

      setStatus("sent");

      // Contact form submitted successfully = a confirmed conversion
      // (books a call). tool_name reflects the referring assessment, if any.
      pushLeadEvent("close_convert_lead", {
        tool_name: referringToolName(),
        lead_type: LEAD_TYPE.bookedCall,
      });
      // Commercial journey: which offer and pillar the enquiry came from,
      // read from the same fixed lists as the "About:" line. Never the
      // visitor's message or details.
      const params = new URLSearchParams(window.location.search);
      const offerParam = params.get("offer");
      const pillarParam = params.get("pillar");
      pushJourneyEvent("enquiry_submitted", {
        offer: isEnquiryTopic(offerParam)
          ? (offerParam as JourneyOffer)
          : JOURNEY_OFFER.general,
        pillar: isPillar(pillarParam) ? pillarParam : null,
      });
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="bg-ecm-green py-20">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        {/* Left: Contact Info */}
        <div>
          <h2 className="text-ecm-lime font-barlow font-bold text-2xl sm:text-3xl mb-4">
            Tell us where it is breaking.
          </h2>
          <p className="text-white/85 font-barlow font-light text-sm sm:text-base leading-relaxed mb-8 max-w-md">
            Which pillar, and what is not working: your CMS, your operating model, or your multilingual content. We reply personally, with a specific next step, not a proposal deck.
          </p>
          <div className="mb-8 max-w-md">
            <p className="text-ecm-lime font-barlow font-semibold text-sm mb-2">What happens next</p>
            <ol className="text-white/80 text-sm leading-relaxed space-y-1 list-decimal list-inside">
              <li>We read your message and reply by email, personally.</li>
              <li>If it looks like a fit, we suggest a short scoping conversation.</li>
              <li>You get a written scope and fee before any paid work starts.</li>
            </ol>
            <p className="text-white/60 text-xs mt-3">
              Sending this does not sign you up to anything, including our mailing list.
            </p>
          </div>
          <a
            href="https://www.linkedin.com/company/ecm-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-6"
          >
            <svg className="w-8 h-8 text-white hover:text-ecm-lime transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <div>
            <a
              href="mailto:rl@ecm.dev"
              className="inline-block bg-ecm-lime text-ecm-green font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors"
            >
              EMAIL US
            </a>
          </div>
        </div>

        {/* Right: Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot — hidden from real users, visible to bots */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
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
          {context && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ecm-lime/30 bg-white/5 px-4 py-3">
              <p className="text-white/85 text-sm">
                <span className="text-white/60">About: </span>
                {context}
              </p>
              <button
                type="button"
                onClick={() => setContext("")}
                className="text-ecm-lime text-xs underline hover:text-ecm-lime-hover"
              >
                Not this, clear it
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-first-name" className="block text-white text-sm mb-1">First name</label>
              <input
                id="contact-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full bg-transparent border-b border-white/60 text-white py-2 focus:border-ecm-lime outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="contact-last-name" className="block text-white text-sm mb-1">Last name</label>
              <input
                id="contact-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full bg-transparent border-b border-white/60 text-white py-2 focus:border-ecm-lime outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-white text-sm mb-1">Email *</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-transparent border-b border-white/60 text-white py-2 focus:border-ecm-lime outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-white text-sm mb-1">Message *</label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full bg-transparent border-b border-white/60 text-white py-2 focus:border-ecm-lime outline-none transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="bg-ecm-lime text-ecm-green font-barlow font-semibold px-10 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors disabled:opacity-50"
          >
            {status === "sending" ? "Sending..." : "Send"}
          </button>
          {status === "sent" && (
            <p role="status" className="text-ecm-lime text-sm mt-3">
              Thank you, your message has reached us. We will reply personally by email.
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="text-red-400 text-sm mt-3">
              Something went wrong and your message was not sent. What you wrote is still here, so please try again, or email rl@ecm.dev directly.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
