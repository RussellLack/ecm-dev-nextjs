import { getCaseStudies } from '@/lib/queries'
import CaseStudyGrid from '@/components/CaseStudyGrid'

export const revalidate = 60

export default async function CaseStudyPage() {
  const caseStudies = await getCaseStudies()

  return (
    <>
      <section className="bg-ecm-green py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-4xl lg:text-5xl mb-4">
            PROJECTS
          </h1>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <CaseStudyGrid caseStudies={caseStudies} />
        </div>
      </section>
    </>
  )
}
