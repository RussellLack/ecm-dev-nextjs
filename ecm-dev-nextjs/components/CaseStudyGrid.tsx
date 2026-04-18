'use client'

import { useState } from 'react'
import Link from 'next/link'

type CaseStudy = {
  _id: string
  title: string
  slug: { current: string }
  client: string
  tags: string[]
  description: string
  imageUrl?: string
}

const tagColors: Record<string, string> = {
  'Content Localization': 'bg-blue-100 text-blue-800',
  'Content Technology': 'bg-purple-100 text-purple-800',
  'Content Services': 'bg-green-100 text-green-800',
}

const ALL_TAGS = ['Content Localization', 'Content Technology', 'Content Services']

export default function CaseStudyGrid({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = activeTag
    ? caseStudies.filter((cs) => cs.tags?.includes(activeTag))
    : caseStudies

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-12 justify-center">
        <button
          onClick={() => setActiveTag(null)}
          className={`text-sm font-barlow font-medium px-4 py-2 rounded-full cursor-pointer transition-opacity ${activeTag === null ? 'bg-ecm-green text-white' : 'bg-gray-200 text-gray-700 hover:opacity-80'}`}
        >
          All ({caseStudies.length})
        </button>
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-sm font-barlow font-medium px-4 py-2 rounded-full cursor-pointer transition-opacity ${activeTag === tag ? 'bg-ecm-green text-white' : `${tagColors[tag]} hover:opacity-80`}`}
          >
            {tag} ({caseStudies.filter((cs) => cs.tags?.includes(tag)).length})
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {filtered.map((cs) => (
          <Link
            key={cs._id}
            href={`/case-study/${cs.slug?.current}`}
            className="group bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-gray-100 block"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {cs.tags?.map((tag) => (
                <span
                  key={tag}
                  className={`${tagColors[tag] || 'bg-gray-200 text-gray-700'} text-xs font-barlow font-medium px-3 py-1 rounded-full`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-ecm-green font-barlow font-bold text-xl mb-2 group-hover:underline">
              {cs.title}
            </h3>
            <p className="text-ecm-gray text-sm font-medium mb-3">{cs.client}</p>
            <p className="text-ecm-gray-dark text-sm leading-relaxed mb-4">
              {cs.description}
            </p>
            <span className="text-ecm-green text-sm font-barlow font-semibold">
              View project →
            </span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-ecm-gray">
          No projects found for this filter.
        </div>
      )}
    </>
  )
}
