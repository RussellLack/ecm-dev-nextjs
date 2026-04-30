import Link from "next/link";
import JsonLd from "./JsonLd";
import { breadcrumbListSchema, type BreadcrumbItem } from "@/lib/structuredData";

/**
 * Visible breadcrumb trail rendered above the page hero. Also emits a
 * BreadcrumbList JSON-LD block with the same items so search engines see
 * the same trail users do.
 *
 * The final item should have `path: null` to render as the current page.
 */
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items?.length) return null;

  return (
    <>
      <JsonLd data={breadcrumbListSchema(items)} />
      <nav
        aria-label="Breadcrumb"
        className="max-w-5xl mx-auto px-6 pt-4 sm:pt-6"
      >
        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-barlow text-white/60">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${item.name}-${i}`} className="flex items-center gap-1.5">
                {item.path && !isLast ? (
                  <Link
                    href={item.path}
                    className="hover:text-ecm-lime transition-colors"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "text-ecm-lime/90" : "text-white/60"}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.name}
                  </span>
                )}
                {!isLast && (
                  <span aria-hidden="true" className="text-white/30">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
