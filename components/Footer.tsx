import Link from "next/link";
import Image from "next/image";

const servicesLinks = [
  { name: "Content Technology", href: "/content-technology" },
  { name: "Content Services", href: "/content-services" },
  { name: "Content Localization", href: "/content-localization" },
];

const siteLinks = [
  { name: "Home", href: "/" },
  { name: "Work", href: "/case-study" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const resourceLinks = [
  { name: "Guides", href: "/guides" },
  { name: "Assessments", href: "/assessments" },
  { name: "Privacy Policy", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="bg-ecm-green-dark pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top row: 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand + address */}
          <div>
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ecm-logo.svg"
                alt="ECM.DEV"
                className="h-7 sm:h-8 lg:h-9 w-auto"
              />
            </Link>
            <div className="text-white/70 text-sm mt-4 space-y-1 leading-relaxed">
              <p>Sognsveien 118C</p>
              <p>Oslo 0860</p>
              <p>Norway</p>
            </div>
          </div>

          {/* Services column */}
          <div>
            <h4 className="text-ecm-lime font-barlow font-semibold text-sm uppercase tracking-wider mb-4">
              Services
            </h4>
            <nav className="flex flex-col gap-2">
              {servicesLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white/70 text-sm hover:text-ecm-lime transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Resources column */}
          <div>
            <h4 className="text-ecm-lime font-barlow font-semibold text-sm uppercase tracking-wider mb-4">
              Resources
            </h4>
            <nav className="flex flex-col gap-2">
              {resourceLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white/70 text-sm hover:text-ecm-lime transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Site links column */}
          <div>
            <h4 className="text-ecm-lime font-barlow font-semibold text-sm uppercase tracking-wider mb-4">
              Site
            </h4>
            <nav className="flex flex-col gap-2">
              {siteLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white/70 text-sm hover:text-ecm-lime transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect column */}
          <div>
            <h4 className="text-ecm-lime font-barlow font-semibold text-sm uppercase tracking-wider mb-4">
              Connect
            </h4>
            <a
              href="mailto:rl@ecm.dev"
              className="inline-block bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-ecm-lime-hover transition-colors mb-4"
            >
              EMAIL US
            </a>
            <div className="flex gap-3 mt-2">
              <a
                href="https://www.linkedin.com/company/ecm-dev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-ecm-lime/20 transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} ECM.DEV. All rights reserved.
          </p>
          <p className="text-white/30 text-xs font-barlow">
            Web design by{" "}
            <a
              href="https://ecm.dev"
              className="text-white/50 hover:text-ecm-lime transition-colors"
            >
              ECM.DEV
            </a>
            {" · "}Built with{" "}
            <a
              href="https://www.sanity.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-ecm-lime transition-colors"
            >
              Sanity.io
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
