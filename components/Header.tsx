"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navigation = [
  { name: "Home", href: "/" },
  {
    name: "Problems We Solve",
    href: "/problems",
    children: [
      { name: "All problems", href: "/problems" },
      { name: "Marketing takes too long", href: "/problems/marketing-takes-too-long" },
      { name: "AI isn't delivering", href: "/problems/ai-isnt-delivering" },
      { name: "Localisation costs keep growing", href: "/problems/localisation-costs-keep-growing" },
      { name: "Our CMS isn't creating value", href: "/problems/our-cms-isnt-creating-value" },
      { name: "Our teams work in silos", href: "/problems/our-teams-work-in-silos" },
    ],
  },
  {
    name: "Solutions",
    href: "/solutions",
    children: [
      { name: "All solutions", href: "/solutions" },
      { name: "Improve Campaign Velocity", href: "/solutions/improve-campaign-velocity" },
      { name: "Scale Global Marketing", href: "/solutions/scale-global-marketing" },
      { name: "Increase CMS ROI", href: "/solutions/increase-cms-roi" },
      { name: "Prepare Content for AI", href: "/solutions/prepare-content-for-ai" },
      { name: "Build a Marketing Operating System", href: "/solutions/build-a-marketing-operating-system" },
    ],
  },
  { name: "Work", href: "/case-study" },
  {
    name: "Services",
    href: "#",
    children: [
      { name: "Content Services", href: "/content-services" },
      { name: "Content Technology", href: "/content-technology" },
      { name: "Content Localization", href: "/content-localization" },
    ],
  },
  { name: "Assessments", href: "/assessments" },
  { name: "Guides", href: "/guides" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="bg-ecm-green sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ecm-logo.svg"
            alt="ECM.DEV"
            className="h-8 sm:h-9 lg:h-10 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navigation.map((item) =>
            item.children ? (
              <div key={item.name} className="relative group">
                <button
                  className="text-white font-barlow font-medium text-sm tracking-wide hover:text-ecm-lime transition-colors"
                  onMouseEnter={() => setOpenMenu(item.name)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {item.name}
                </button>
                <div
                  className={`absolute top-full left-0 mt-2 bg-ecm-green-dark rounded-lg shadow-xl py-2 min-w-[220px] transition-all ${
                    openMenu === item.name
                      ? "opacity-100 visible"
                      : "opacity-0 invisible"
                  }`}
                  onMouseEnter={() => setOpenMenu(item.name)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="block px-4 py-2 text-white text-sm hover:text-ecm-lime hover:bg-ecm-green transition-colors whitespace-nowrap"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className="text-white font-barlow font-medium text-sm tracking-wide hover:text-ecm-lime transition-colors"
              >
                {item.name}
              </Link>
            )
          )}
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
        <div className="lg:hidden bg-ecm-green-dark px-6 py-6">
          {navigation.map((item) =>
            item.children ? (
              <div key={item.name} className="mb-4">
                <span className="text-white font-barlow font-medium text-lg">
                  {item.name}
                </span>
                <div className="ml-4 mt-2 space-y-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="block text-gray-300 hover:text-ecm-lime"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className="block text-white font-barlow font-medium text-lg mb-4 hover:text-ecm-lime"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            )
          )}
          <Link
            href="/assessments"
            className="block text-center bg-ecm-lime text-ecm-green font-barlow font-bold text-base mt-2 px-6 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Take the assessment · 10 min
          </Link>
        </div>
      )}
    </header>
  );
}
