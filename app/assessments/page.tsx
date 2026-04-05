import Link from "next/link";
import { getAllAssessments } from "@/lib/assessment/queries";

export const revalidate = 60;

export const metadata = {
  title: "Assessments | ECM.DEV",
  description:
    "Diagnostic assessments to benchmark your content operations maturity, AI readiness, and more.",
};

export default async function AssessmentsPage() {
  const assessments = await getAllAssessments().catch(() => []);

  // Only show editor controls when SANITY_WRITE_TOKEN is present (i.e. not in production)
  const showEditorControls = !!process.env.SANITY_WRITE_TOKEN;
  const studioUrl =
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
    "https://ecm-assessment.sanity.studio";

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-28 pb-24 sm:pb-28 lg:pb-36 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            Assessments
          </h1>
          <p className="text-white/70 font-barlow text-lg max-w-2xl mx-auto">
            Free diagnostic tools to benchmark where you stand — and see where
            to focus next.
          </p>
        </div>
        {/* Wave divider: green → white */}
        <div className="wave-divider wave-divider-bottom">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* Assessments List */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">

          {/* ── Hardcoded: Lead Magnet Ideation Tool ── */}
          <div className="space-y-12 mb-12">
            <div className="group relative bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
              <div className="p-8 sm:p-10 lg:p-12">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-ecm-green font-barlow font-bold text-xl sm:text-2xl lg:text-3xl mb-3 group-hover:text-ecm-green-dark transition-colors">
                      Lead Magnet Ideation Tool
                    </h2>
                    <p className="text-ecm-gray font-barlow text-base mb-4">
                      Find your best-fit lead magnet format and close the capability gaps holding you back.
                    </p>
                    <p className="text-gray-500 font-barlow text-sm leading-relaxed mb-6 max-w-2xl">
                      Answer 13 questions about your market position, authority, and capabilities. Get three ranked lead
                      magnet recommendations with specific topic ideas, a capability radar chart, and targeted gap-closing actions.
                    </p>
                    <div className="flex items-center gap-5 text-gray-400 font-barlow text-sm">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        5 min
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                        </svg>
                        13 questions
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 lg:pt-2">
                    <Link
                      href="/assessment/lead-magnet"
                      className="inline-flex items-center gap-2 bg-ecm-green text-white font-barlow font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-ecm-green-dark transition-colors"
                    >
                      Take assessment
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-ecm-lime w-0 group-hover:w-full transition-all duration-500" />
            </div>
          </div>

          {assessments.length > 0 ? (
            <div className="space-y-12">
              {assessments.map((a: any) => (
                <div
                  key={a._id}
                  className="group relative bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-8 sm:p-10 lg:p-12">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Content */}
                      <div className="flex-1">
                        <h2 className="text-ecm-green font-barlow font-bold text-xl sm:text-2xl lg:text-3xl mb-3 group-hover:text-ecm-green-dark transition-colors">
                          {a.title}
                        </h2>
                        {a.subtitle && (
                          <p className="text-ecm-gray font-barlow text-base mb-4">
                            {a.subtitle}
                          </p>
                        )}
                        {a.introText && (
                          <p className="text-gray-500 font-barlow text-sm leading-relaxed mb-6 max-w-2xl">
                            {a.introText}
                          </p>
                        )}
                        <div className="flex items-center gap-5 text-gray-400 font-barlow text-sm">
                          {a.estimatedMinutes && (
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {a.estimatedMinutes} min
                            </div>
                          )}
                          {a.questionCount > 0 && (
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                                />
                              </svg>
                              {a.questionCount} questions
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex-shrink-0 lg:pt-2">
                        <Link
                          href={`/assessment/${a.slug?.current}`}
                          className="inline-flex items-center gap-2 bg-ecm-green text-white font-barlow font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-ecm-green-dark transition-colors"
                        >
                          Take assessment
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Accent bar */}
                  <div className="h-1 bg-ecm-lime w-0 group-hover:w-full transition-all duration-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 font-barlow text-lg">
                No assessments published yet. Check back soon.
              </p>
            </div>
          )}

          {/* Editor: Create New Assessment — only visible in dev/admin environments */}
          {showEditorControls && (
            <div className="mt-16 text-center">
              <div className="inline-flex flex-col items-center gap-3 px-8 py-6 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                <p className="text-gray-400 font-barlow text-sm">
                  Want to add a new assessment?
                </p>
                <a
                  href={`${studioUrl}/structure/assessment`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-ecm-lime text-ecm-green font-barlow font-bold text-sm px-6 py-2.5 rounded-full hover:bg-ecm-lime-hover transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Create New Assessment
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
