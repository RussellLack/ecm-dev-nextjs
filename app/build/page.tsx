import type { Metadata } from "next";
import Link from "next/link";
import { getBuildPage } from "@/lib/queries";

export const revalidate = 3600;

/* ─── Static fallback data (used when Sanity fields are empty) ─── */

const fallback = {
  hero: "You have a list. You have a landing page. They don't talk to each other.",
  subheadline:
    "ECM.DEV builds the outbound stack for B2B companies who are generating interest but losing pipeline between the email and the meeting. We engineer the three components that fix this: a clean targeted prospect list, an interactive tool that qualifies before you pitch, and a landing flow wired into your CRM. Hands-on build, fixed scope, fast turnaround. You own everything.",
  primaryCTA: { label: "Start with a free assessment", url: "/assessments" },
  secondaryCTA: { label: "Talk to us directly", url: "/contact" },

  problemsHeading: "You are probably losing pipeline at one of these three points.",
  problemsSubheading:
    "All three are fixable. Each one is a discrete engineering problem, not a strategy problem.",
  problems: [
    {
      number: "01",
      title: "Between the email and the click",
      body: "Your emails are reaching the right people and some are opening. But the reply rate is flat. The email copy, the CTA, or the destination it points to is breaking the chain. This is not a deliverability problem or a volume problem. It is a conversion layer problem.",
    },
    {
      number: "02",
      title: "Between the click and the meeting",
      body: "Someone clicked. They landed on your site. They left. A static page with a contact form asks for maximum commitment at minimum trust. An interactive tool, a scored assessment, or a multi-step flow changes that equation. It gives the prospect a reason to engage before they commit to a meeting.",
    },
    {
      number: "03",
      title: "Between the meeting and the deal",
      body: "You are booking meetings but the wrong ones. People who were curious but not qualified. The fix is upstream: build qualification into the conversion layer before the meeting happens, so the calls you do take are with people who already understand the problem and are looking for the solution.",
    },
  ],

  deliverablesHeading: "Three things we build. Any one of them on its own changes the equation.",
  deliverables: [
    {
      title: "Prospect list build and QA",
      body: "We research, build, enrich, and verify a targeted prospect list for one segment of your ICP. Clean data, correct titles, verified emails, segmented by the signal that matters for your specific offer. Ready to load into your outbound tool.",
      price: "From €1,500",
      turnaround: "5 to 7 business days",
    },
    {
      title: "Conversion tool",
      body: "An interactive assessment, a scored calculator, or a configurator that sits between your cold email click and your booking page. Qualifies the prospect, delivers a personalised result, and hands a warm, context-rich lead to your CRM. Stack-agnostic. We have built these on React, Next.js, Webflow, HubSpot, and custom stacks.",
      price: "From €2,500",
      turnaround: "1 to 2 weeks",
    },
    {
      title: "Landing flow",
      body: "A multi-step landing experience connected to your CRM. Not a single page with a form. A flow: entry point, qualification step, personalised outcome, booking or next-step trigger. Built to convert cold outbound traffic, not to win design awards.",
      price: "From €3,500",
      turnaround: "1 to 2 weeks",
    },
  ],

  howWeWorkHeading: "How an engagement works.",
  steps: [
    {
      number: "01",
      title: "You describe the problem",
      body: "Tell us what you are running: the outbound motion, the current conversion rate, where you think the leak is. Use the contact form or book a 20-minute call. No discovery deck. No RFP process.",
    },
    {
      number: "02",
      title: "We scope it in 48 hours",
      body: "We come back with a specific recommendation: which component to build first, what it will cost, and what it will take to deliver. Fixed price, fixed scope, written in plain language. You say yes or no.",
    },
    {
      number: "03",
      title: "We build it",
      body: "We build the component, QA it, and hand it over with documentation. You own everything. We use your stack wherever possible. Where we recommend a different approach, we explain why before we start.",
    },
    {
      number: "04",
      title: "You decide what comes next",
      body: "Some clients take one component and run with it. Others come back for the next piece. We also offer a monthly retainer for teams who want an ongoing build partner rather than a series of fixed projects. No lock-in either way.",
    },
  ],

  ctaHeading: "Tell us what you are running.",
  ctaSubheading:
    "Describe the outbound motion and where it is losing people. We will come back with a specific observation, not a proposal deck.",
  ctaButtonLabel: "Start with a free assessment",
  ctaButtonUrl: "/assessments",

  seo: {
    title: "Build Your Outbound Stack — ECM.DEV",
    description:
      "ECM.DEV builds the conversion layer between your cold outreach and your booked meeting. Prospect lists, interactive tools, CRM-connected landing flows. Fixed scope, fast, hands-on.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getBuildPage().catch(() => null);
  const title = data?.seo?.title || fallback.seo.title;
  const description = data?.seo?.description || fallback.seo.description;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/build" },
    openGraph: { type: "website", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BuildPage() {
  const data = await getBuildPage().catch(() => null);

  const hero = data?.hero || fallback.hero;
  const subheadline = data?.subheadline || fallback.subheadline;
  const primaryCTA = data?.primaryCTA?.label && data?.primaryCTA?.url ? data.primaryCTA : fallback.primaryCTA;
  const secondaryCTA = data?.secondaryCTA?.label && data?.secondaryCTA?.url ? data.secondaryCTA : fallback.secondaryCTA;

  const problemsHeading = data?.problemsHeading || fallback.problemsHeading;
  const problemsSubheading = data?.problemsSubheading || fallback.problemsSubheading;
  const problems = data?.problems?.length ? data.problems : fallback.problems;

  const deliverablesHeading = data?.deliverablesHeading || fallback.deliverablesHeading;
  const deliverables = data?.deliverables?.length ? data.deliverables : fallback.deliverables;

  const howWeWorkHeading = data?.howWeWorkHeading || fallback.howWeWorkHeading;
  const steps = data?.steps?.length ? data.steps : fallback.steps;

  const ctaHeading = data?.ctaHeading || fallback.ctaHeading;
  const ctaSubheading = data?.ctaSubheading || fallback.ctaSubheading;
  const ctaButtonLabel = data?.ctaButtonLabel || fallback.ctaButtonLabel;
  const ctaButtonUrl = data?.ctaButtonUrl || fallback.ctaButtonUrl;

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-ecm-green py-20 sm:py-28 lg:py-32 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
            {hero}
          </h1>
          <p className="text-white/90 font-barlow font-light text-base sm:text-lg leading-relaxed mb-10">
            {subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={primaryCTA.url}
              className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
            >
              {primaryCTA.label}
            </Link>
            <Link
              href={secondaryCTA.url}
              className="inline-flex items-center justify-center border-2 border-ecm-lime text-ecm-lime font-barlow font-semibold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime hover:text-ecm-green transition-colors"
            >
              {secondaryCTA.label}
            </Link>
          </div>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* ─── PROBLEMS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            {problemsHeading}
          </h2>
          <p className="text-ecm-gray-dark text-center text-base mb-16 max-w-2xl mx-auto">
            {problemsSubheading}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((problem: any, i: number) => (
              <div
                key={i}
                className="bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20"
              >
                <p className="text-ecm-lime font-barlow font-bold text-2xl mb-3">{problem.number}</p>
                <h3 className="text-white font-barlow font-bold text-lg mb-3">{problem.title}</h3>
                <p className="text-white/85 text-sm leading-relaxed">{problem.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DELIVERABLES ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            {deliverablesHeading}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {deliverables.map((item: any, i: number) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 sm:p-8 border border-ecm-green/15 shadow-sm flex flex-col"
              >
                <h3 className="text-ecm-green font-barlow font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-ecm-gray-dark text-sm leading-relaxed mb-6 flex-1">{item.body}</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-ecm-green font-barlow font-bold text-sm">{item.price}</span>
                  <span className="text-ecm-gray text-xs">{item.turnaround}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW WE WORK ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            {howWeWorkHeading}
          </h2>
          <div className="space-y-10">
            {steps.map((step: any, i: number) => (
              <div key={i} className="flex gap-6">
                <div className="shrink-0 w-10 h-10 bg-ecm-lime rounded-lg flex items-center justify-center">
                  <span className="text-ecm-green-dark font-barlow font-bold text-lg">{step.number}</span>
                </div>
                <div>
                  <h3 className="text-ecm-green font-barlow font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-ecm-gray-dark text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-ecm-green py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-white font-barlow font-bold text-3xl lg:text-4xl mb-4">
            {ctaHeading}
          </h2>
          <p className="text-white/85 text-base leading-relaxed mb-8">
            {ctaSubheading}
          </p>
          <Link
            href={ctaButtonUrl}
            className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors mb-4"
          >
            {ctaButtonLabel}
          </Link>
          <p className="text-white/70 text-sm">
            Or talk to us directly &rarr;{" "}
            <Link href="/contact" className="underline hover:text-ecm-lime">
              ecm.dev/contact
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
