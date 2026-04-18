import Link from "next/link";

const blogPosts = [
  { title: "Kentico CMS Cadence Cuts Migration Risk", date: "Sep 16, 2025", slug: "kentico-cadence-cuts-migration-risk" },
  { title: "Agentic CX: From Journeys to Agents", date: "Sep 15, 2025", slug: "agentic-cx-from-journeys-to-agents" },
  { title: "Sanity CMS Upgrades Speed CX Delivery", date: "Sep 12, 2025", slug: "sanity-cms-upgrades-speed-cx-delivery" },
  { title: "Unlocking Sitecore Productivity", date: "Sep 12, 2025", slug: "sitecore-productivity-and-roi" },
  { title: "Ibexa v5: Europe\u2019s B2B DXP", date: "Sep 9, 2025", slug: "ibexa-v5-europe-s-b2b-dxp" },
  { title: "Hyland Content Innovation Cloud: Modernize Without Migration", date: "Aug 28, 2025", slug: "hyland-content-innovation-cloud" },
  { title: "Contentful AI Workflows Boost Speed", date: "Aug 20, 2025", slug: "contentful-ai-workflows-boost-speed" },
  { title: "Optimizely AEO/GEO: AI Visibility", date: "Aug 15, 2025", slug: "optimizely-aeo-geo-ai-visibility" },
  { title: "Website Localization for Static and Dynamic Websites", date: "Aug 8, 2025", slug: "navigate-digital-transformation-with-fab-partners-expertise" },
  { title: "The B2B DXP Adoption Playbook", date: "Aug 1, 2025", slug: "the-b2b-playbook-for-ai-enhanced-dxps" },
];

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ecm-green py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-4xl lg:text-5xl">
            BLOG
          </h1>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <Link
                key={i}
                href={`/post/${post.slug}`}
                className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group border border-gray-100"
              >
                <div className="h-48 bg-ecm-green/10 flex items-center justify-center">
                  <div className="w-16 h-16 bg-ecm-green/20 rounded-xl" />
                </div>
                <div className="p-6">
                  <h2 className="text-ecm-green font-barlow font-semibold text-lg mb-3 group-hover:text-ecm-green-dark transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-ecm-gray text-sm">{post.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
