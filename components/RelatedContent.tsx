import Link from "next/link";
import { urlFor } from "@/lib/sanity";

type RelatedItem = {
  _id?: string;
  title: string;
  slug?: { current?: string } | string;
  excerpt?: string;
  description?: string;
  publishedAt?: string;
  mainImage?: any;
  image?: any;
  client?: string;
  tags?: string[];
};

function slugString(slug: RelatedItem["slug"]): string {
  if (!slug) return "";
  return typeof slug === "string" ? slug : slug.current ?? "";
}

function imageFor(item: RelatedItem) {
  return item.mainImage ?? item.image ?? null;
}

/**
 * Cross-link block rendered at the foot of post and case-study detail pages.
 *
 * Items typically come from a curated reference array on the document, with
 * a tag/pillar fallback query supplying additional matches when the curated
 * list is short. Pass the merged, deduped list as `items`.
 */
export default function RelatedContent({
  heading = "Related reading",
  items,
  hrefPrefix,
}: {
  heading?: string;
  items: RelatedItem[];
  hrefPrefix: "/post" | "/guide" | "/case-study";
}) {
  if (!items?.length) return null;

  return (
    <section className="pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-gray-100 pt-8">
          <p className="text-ecm-gray text-xs font-barlow font-semibold uppercase tracking-widest mb-5">
            {heading}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((item) => {
              const slug = slugString(item.slug);
              if (!slug) return null;
              const img = imageFor(item);
              const blurb = item.excerpt || item.description || item.client;
              return (
                <Link
                  key={item._id ?? slug}
                  href={`${hrefPrefix}/${slug}`}
                  className="group flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-ecm-green/8 overflow-hidden flex items-center justify-center">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={urlFor(img).width(128).height(128).fit("crop").url()}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-ecm-green/40 text-xs font-barlow font-semibold">
                        ECM
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-ecm-green font-barlow font-semibold text-sm leading-snug group-hover:text-ecm-green-dark transition-colors line-clamp-2">
                      {item.title}
                    </p>
                    {blurb && (
                      <p className="text-ecm-gray text-xs mt-1 line-clamp-2">
                        {blurb}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
