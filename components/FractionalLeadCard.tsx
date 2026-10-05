import Image from "next/image";
import Link from "next/link";
import { enquiryHref, type Pillar, type SolutionSlug } from "@/lib/offers";

/* Russell as the accountable senior lead behind a first project, with
   fractional support as an optional continuation, never a required first
   purchase. Copy is approved wording from the solution pages brief; it
   states no years of experience, certifications, results, capacity or
   availability, and "fractional" means agreed part-time responsibility.
   The portrait is the existing one used on /about. Used on the
   /solutions/<slug> workflow pages and on /content-operations. */
export default function FractionalLeadCard({
  note,
  solution,
  pillar,
  headingId = "fractional-lead",
}: {
  /** Optional page-specific sentence, shown after the main copy. */
  note?: string;
  /** Carried into the contact form so the enquiry keeps its context. */
  solution?: SolutionSlug;
  pillar?: Pillar;
  headingId?: string;
}) {
  return (
    <section aria-labelledby={headingId} className="bg-surface py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-surface-alt border border-surface-border rounded-2xl p-6 sm:p-10 grid gap-8 md:grid-cols-[180px_1fr] items-start">
          <div className="flex md:block items-center gap-4">
            <div className="relative w-24 h-28 md:w-[180px] md:h-[212px] shrink-0 rounded-xl overflow-hidden bg-ecm-green">
              <Image
                src="/team/russell-lack.png"
                alt="Portrait of Russell Lack"
                fill
                sizes="(min-width: 768px) 180px, 96px"
                className="object-cover"
              />
            </div>
            <div className="md:mt-4">
              <p className="text-heading font-barlow font-bold text-lg leading-tight">
                Russell Lack
              </p>
              <p className="text-ink-muted text-sm">
                Founder · Fractional content operations lead
              </p>
            </div>
          </div>

          <div>
            <h2
              id={headingId}
              className="text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-4"
            >
              Senior ownership for the work between expertise, content and sales.
            </h2>
            <p className="text-ink text-base leading-relaxed mb-4">
              I help your team turn specialist knowledge into clear, approved
              material and repeatable workflows. That means connecting the
              people, information and systems needed to keep content useful
              across buying journeys and markets.
            </p>
            <p className="text-ink text-base leading-relaxed mb-4">
              Start with one defined project. If you need continued support, I
              can lead agreed priorities, coordinate contributors and keep
              approvals and improvements moving, with a scope and rhythm that
              fit your team.
            </p>
            {note && (
              <p className="text-ink text-base leading-relaxed mb-4">{note}</p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6">
              <Link
                href={enquiryHref("first-project", pillar, solution)}
                className="inline-flex items-center justify-center bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-heading"
              >
                Discuss a first project
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-1 text-heading font-barlow font-semibold text-sm underline underline-offset-4 hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-heading"
              >
                About Russell and ECM.DEV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
