import Link from "next/link";

const footerLinks = [
  { name: "Home", href: "/" },
  { name: "Work", href: "/case-study" },
  { name: "Services", href: "/content-services" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/#contact" },
];

export default function Footer() {
  return (
    <footer className="bg-ecm-green py-8">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex flex-wrap justify-center gap-8 mb-6">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-white font-barlow text-sm hover:text-ecm-lime transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} by ECM DEV
        </div>
      </div>
    </footer>
  );
}
