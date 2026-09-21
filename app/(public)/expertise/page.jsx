import ExpertiseClient from './ExpertiseClient'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { getSeoMeta, getSeoSchemas, getPageFaqs } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'expertise',
    fallback: {
      title: 'Marketing Expertise | Prince Pandey',
      description: 'A full breakdown of the marketing discipline I\'ve mastered — from fundamentals and measurement to platform execution, creative, lifecycle marketing, and advanced analytics.',
      path: '/expertise',
    },
  })
}

export default async function Page() {
  const [graph, faqs] = await Promise.all([
    getSeoSchemas({ contentType: 'expertise' }),
    getPageFaqs('expertise'),
  ])
  return (
    <>
      <SchemaScript schemas={graph} />
      <ExpertiseClient />
      <FaqSection faqs={faqs} />
    </>
  )
}
