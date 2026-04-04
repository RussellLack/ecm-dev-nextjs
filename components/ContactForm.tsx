"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send");

      setStatus("sent");
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
          <h2 className="text-ecm-lime font-barlow font-bold text-2xl sm:text-3xl mb-8">
            GET IN TOUCH
          </h2>
          <div className="text-white space-y-1 mb-8">
            <p>Sognsveien 118C</p>
            <p>Oslo 0860</p>
            <p>Norway</p>
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
            <button className="bg-ecm-lime text-ecm-green font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors">
              EMAIL US
            </button>
          </div>
        </div>

        {/* Right: Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">First name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full bg-transparent border-b border-white/40 text-white py-2 focus:border-ecm-lime outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Last name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full bg-transparent border-b border-white/40 text-white py-2 focus:border-ecm-lime outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-transparent border-b border-white/40 text-white py-2 focus:border-ecm-lime outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-1">Message *</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full bg-transparent border-b border-white/40 text-white py-2 focus:border-ecm-lime outline-none transition-colors resize-none"
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
            <p className="text-ecm-lime text-sm mt-3">Thank you! Your message has been sent.</p>
          )}
          {status === "error" && (
            <p className="text-red-400 text-sm mt-3">Something went wrong. Please try again.</p>
          )}
        </form>
      </div>
    </section>
  );
}
