"use client";

import { useState } from "react";
import Link from "next/link";

const navigation = [
  { name: "Home", href: "/" },
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
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/#contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="bg-ecm-green sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-ecm-lime font-barlow font-extrabold text-3xl tracking-wider">
            ECM.DEV
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navigation.map((item) =>
            item.children ? (
              <div key={item.name} className="relative group">
                <button
                  className="text-white font-barlow font-medium text-sm tracking-wide hover:text-ecm-lime transition-colors"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  {item.name}
                </button>
                <div
                  className={`absolute top-full left-0 mt-2 bg-ecm-green-dark rounded-lg shadow-xl py-2 min-w-[200px] transition-all ${
                    servicesOpen
                      ? "opacity-100 visible"
                      : "opacity-0 invisible"
                  }`}
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="block px-4 py-2 text-white text-sm hover:text-ecm-lime hover:bg-ecm-green transition-colors"
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
            href="/#contact"
            className="bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-2 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            START NOW
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-ecm-lime"
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
        </div>
      )}
    </header>
  );
}
