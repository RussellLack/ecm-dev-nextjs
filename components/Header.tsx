"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Menu data ─────────────────────────────────────────────── */

const problems = [
  { name: "Marketing takes too long", href: "/problems/marketing-takes-too-long" },
  { name: "AI isn't delivering", href: "/problems/ai-isnt-delivering" },
  { name: "Localisation costs keep growing", href: "/problems/localisation-costs-keep-growing" },
  { name: "Our CMS isn't creating value", href: "/problems/our-cms-isnt-creating-value" },
  { name: "Our teams work in silos", href: "/problems/our-teams-work-in-silos" },
];

const solutions = [
  { name: "Improve Campaign Velocity", href: "/solutions/improve-campaign-velocity" },
  { name: "Scale Global Marketing", href: "/solutions/scale-global-marketing" },
  { name: "Increase CMS ROI", href: "/solutions/increase-cms-roi" },
  { name: "Prepare Content for AI", href: "/solutions/prepare-content-for-ai" },
  { name: "Build a Marketing Operating System", href: "/solutions/build-a-marketing-operating-system" },
];

const services = [
  {
    name: "Content Services",
    href: "/content-services",
    blurb: "Editorial, production and governance run as a managed operation.",
  },
  {
    name: "Content Technology",
    href: "/content-technology",
    blurb: "CMS architecture and integration that turns your platform into an asset.",
  },
  {
    name: "Content Localisation",
    href: "/content-localization",
    blurb: "Multilingual delivery at scale, without the cost creep.",
  },
];

const briefings = [
  {
    name: "Content Infrastructure Explained",
    href: "/briefings/content-infrastructure-explained",
    blurb: "What it is, and how to tell if yours is holding marketing back.",
  },
  {
    name: "Why AI Projects Fail",
    href: "/briefings/why-ai-projects-fail",
    blurb: "They rarely fail on the model. They fail on the content underneath.",
  },
  {
    name: "The Hidden Cost of Content Chaos",
    href: "/briefings/the-hidden-cost-of-content-chaos",
    blurb: "What fragmented content really costs, in time, money and risk.",
  },
];

const insightsMore = [
  { name: "All briefings", href: "/briefings", blurb: "The full set of board-level briefings." },
  { name: "Guides", href: "/guides", blurb: "The library of practical playbooks." },
  { name: "Blog", href: "/blog", blurb: "Shorter takes and current thinking." },
];

/* Flat menus for the mobile accordion */
const mobileMenus = [
  { name: "Solutions", href: "/solutions", children: [{ name: "Start with a problem", href: "/problems", heading: true }, ...problems, { name: "Explore by outcome", href: "/solutions", heading: true }, ...solutions] },
  { name: "Insights", href: "/briefings", children: [...briefings, ...insightsMore] },
  { name: "Services", href: "/content-services", children: services },
];

/* ── Shared styles ─────────────────────────────────────────── */

const triggerClass =
  "text-white font-barlow font-medium text-sm tracking-wide hover:text-ecm-lime transition-colors inline-flex items-center gap-1";
const panelBase =
  "absolute top-full mt-3 bg-ecm-green-dark rounded-xl shadow-2xl ring-1 ring-white/10 z-50 transition-all duration-150";
const labelClass =
  "text-ecm-lime/80 font-barlow font-bold text-[11px] tracking-[0.18em] uppercase mb-3";

function Caret() {
  return (
    <svg className="w-3 h-3 opacity-70" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);

  return (
    <header className="bg-ecm-green sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ecm-logo.svg" alt="ECM.DEV" className="h-8 sm:h-9 lg:h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* Solutions mega */}
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("solutions")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button className={triggerClass} aria-expanded={openMenu === "solutions"}>
              Solutions <Caret />
            </button>
            <div
              className={`${panelBase} left-0 w-[640px] ${
                openMenu === "solutions" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
              }`}
            >
              <div className="grid grid-cols-2 gap-x-8 p-7">
                <div>
                  <p className={labelClass}>Start with a problem</p>
                  <ul className="space-y-1">
                    {problems.map((p) => (
                      <li key={p.href}>
                        <Link
                          href={p.href}
                          className="block rounded-lg px-3 py-2 text-white text-sm hover:text-ecm-lime hover:bg-ecm-green transition-colors"
                        >
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className={labelClass}>Explore by outcome</p>
                  <ul className="space-y-1">
                    {solutions.map((s) => (
                      <li key={s.href}>
                        <Link
                          href={s.href}
                          className="block rounded-lg px-3 py-2 text-white text-sm hover:text-ecm-lime hover:bg-ecm-green transition-colors"
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Services callout */}
              <Link
                href="/content-services"
                className="flex items-center justify-between gap-4 border-t border-white/10 px-7 py-4 rounded-b-xl hover:bg-ecm-green transition-colors group/callout"
              >
                <span className="text-white/90 text-sm font-barlow">
                  Ready to engage?{" "}
                  <span className="text-ecm-lime font-semibold">See services and pricing</span>
                </span>
                <span className="text-ecm-lime group-hover/callout:translate-x-1 transition-transform" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* Work */}
          <Link href="/case-study" className={triggerClass}>
            Work
          </Link>

          {/* Insights mega */}
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("insights")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button className={triggerClass} aria-expanded={openMenu === "insights"}>
              Insights <Caret />
            </button>
            <div
              className={`${panelBase} left-1/2 -translate-x-1/2 w-[660px] ${
                openMenu === "insights" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
              }`}
            >
              <div className="grid grid-cols-2 gap-x-8 p-7">
                <div>
                  <p className={labelClass}>Executive briefings</p>
                  <ul className="space-y-1">
                    {briefings.map((b) => (
                      <li key={b.href}>
                        <Link
                          href={b.href}
                          className="block rounded-lg px-3 py-2 hover:bg-ecm-green transition-colors group/item"
                        >
                          <span className="block text-white text-sm font-semibold group-hover/item:text-ecm-lime transition-colors">
                            {b.name}
                          </span>
                          <span className="block text-white/60 text-xs leading-snug mt-0.5">{b.blurb}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className={labelClass}>Go deeper</p>
                  <ul className="space-y-1">
                    {insightsMore.map((m) => (
                      <li key={m.href}>
                        <Link
                          href={m.href}
                          className="block rounded-lg px-3 py-2 hover:bg-ecm-green transition-colors group/item"
                        >
                          <span className="block text-white text-sm font-semibold group-hover/item:text-ecm-lime transition-colors">
                            {m.name}
                          </span>
                          <span className="block text-white/60 text-xs leading-snug mt-0.5">{m.blurb}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Services (the commercial offer) */}
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("services")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button className={triggerClass} aria-expanded={openMenu === "services"}>
              Services <Caret />
            </button>
            <div
              className={`${panelBase} right-0 w-[340px] ${
                openMenu === "services" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
              }`}
            >
              <div className="p-6">
                <p className={labelClass}>Our engagements</p>
                <ul className="space-y-1">
                  {services.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="block rounded-lg px-3 py-2 hover:bg-ecm-green transition-colors group/item"
                      >
                        <span className="block text-white text-sm font-semibold group-hover/item:text-ecm-lime transition-colors">
                          {s.name}
                        </span>
                        <span className="block text-white/60 text-xs leading-snug mt-0.5">{s.blurb}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="border-t border-white/10 px-6 py-3.5 text-ecm-lime/90 text-xs font-barlow font-medium">
                Fixed-scope engagements with clear pricing.
              </p>
            </div>
          </div>

          {/* Contact secondary link */}
          <Link href="/contact" className="text-white/70 font-barlow font-medium text-sm tracking-wide hover:text-ecm-lime transition-colors">
            Contact
          </Link>

          {/* CTA */}
          <Link
            href="/assessments"
            className="bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-2 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            Take the assessment
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-ecm-lime p-2 -mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Lime accent line */}
      <div className="h-[2px] bg-ecm-lime" />

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-ecm-green-dark px-6 py-6 max-h-[calc(100vh-88px)] overflow-y-auto">
          {mobileMenus.map((menu) => (
            <div key={menu.name} className="border-b border-white/10">
              <button
                className="w-full flex items-center justify-between py-4 text-white font-barlow font-semibold text-lg"
                onClick={() => setMobileSubmenu(mobileSubmenu === menu.name ? null : menu.name)}
                aria-expanded={mobileSubmenu === menu.name}
              >
                {menu.name}
                <svg
                  className={`w-4 h-4 transition-transform ${mobileSubmenu === menu.name ? "rotate-180" : ""}`}
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {mobileSubmenu === menu.name && (
                <div className="pb-4 pl-1 space-y-1">
                  {menu.children.map((child) =>
                    "heading" in child && child.heading ? (
                      <p key={child.name} className="text-ecm-lime/80 font-barlow font-bold text-[11px] tracking-[0.18em] uppercase mt-4 mb-1 pl-3">
                        {child.name}
                      </p>
                    ) : (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-lg px-3 py-2 text-gray-200 text-sm hover:text-ecm-lime hover:bg-ecm-green transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.name}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Work + Contact flat links */}
          <Link
            href="/case-study"
            className="block py-4 text-white font-barlow font-semibold text-lg border-b border-white/10 hover:text-ecm-lime"
            onClick={() => setMobileOpen(false)}
          >
            Work
          </Link>
          <Link
            href="/contact"
            className="block py-4 text-white font-barlow font-semibold text-lg border-b border-white/10 hover:text-ecm-lime"
            onClick={() => setMobileOpen(false)}
          >
            Contact
          </Link>

          {/* CTA */}
          <Link
            href="/assessments"
            className="block text-center bg-ecm-lime text-ecm-green font-barlow font-bold text-base mt-6 px-6 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Take the assessment · 10 min
          </Link>
        </div>
      )}
    </header>
  );
}
