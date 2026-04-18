import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { getCaseStudy, getCaseStudySlugs } from '@/lib/queries'

type Props = {
  params: { slug: string }
}

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs()
  return slugs.map(({ slug }: { slug: string }) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const cs = await getCaseStudy(params.slug)
  if (!cs) return {}
  return {
    title: `${cs.title} | ECM.DEV`,
    description: cs.description,
  }
}

const tagColors: Record<string, string> = {
  'Content Localization': 'bg-blue-100 text-blue-800',
  'Content Technology': 'bg-purple-100 text-purple-800',
  'Content Services': 'bg-green-100 text-green-800',
}

function Section({ label, content }: { label: string; content?: string }) {
  if (!content) return null
  return (
    <div className="mb-10">
      <h2 className="text-ecm-green font-barlow font-bold text-xl mb-3 uppercase tracking-wide">
        {label}
      </h2>
      <div className="w-12 h-0.5 bg-ecm-lime mb-4" />
      <p className="text-ecm-gray-dark leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  )
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const cs = await getCaseStudy(params.slug)

  if (!cs) notFound()

  const hasOfferContent =
    cs.whoThisIsFor || cs.theChallenge || cs.whatWePropose || cs.whyItMatters

  return (
    <>
      <section className="bg-ecm-green py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-6">
            <Link
              href="/case-study"
              className="text-ecm-lime/70 hover:text-ecm-lime text-sm font-barlow transition-colors"
            >
              ← All Projects
            </Link>
          </div>

          {cs.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {cs.tags.map((tag: string) => (
                <span
                  key={tag}
                  className={`${
                    tagColors[tag] || 'bg-gray-200 text-gray-700'
                  } text-xs font-barlow font-medium px-3 py-1 rounded-full`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-ecm-lime font-barlow font-bold text-4xl lg:text-5xl mb-4">
            {cs.title}
          </h1>
          <p className="text-white/70 font-barlow text-lg">{cs.client}</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">

          {cs.description && (
            <div className="mb-12 pb-12 border-b border-gray-100">
              <p className="text-ecm-gray-dark text-lg leading-relaxed">{cs.description}</p>
            </div>
          )}

          {hasOfferContent && (
            <div className="grid md:grid-cols-2 gap-x-16">
              <Section label="Who This Is For" content={cs.whoThisIsFor} />
              <Section label="The Challenge" content={cs.theChallenge} />
              <Section label="What We Propose" content={cs.whatWePropose} />
              <Section label="Why It Matters" content={cs.whyItMatters} />
            </div>
          )}

          {cs.body?.length > 0 && (
            <div className="prose prose-lg max-w-none mt-12 pt-12 border-t border-gray-100">
              <PortableText value={cs.body} />
            </div>
          )}

          <div className="mt-16 pt-12 border-t border-gray-100 text-center">
            <p className="text-ecm-gray font-barlow text-lg mb-6">
              Ready to build your next project?
            </p>
            <Link
              href="/contact"
              className="inline-block bg-ecm-green text-white font-barlow font-bold px-8 py-4 rounded-full hover:bg-ecm-green/90 transition-colors"
            >
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
