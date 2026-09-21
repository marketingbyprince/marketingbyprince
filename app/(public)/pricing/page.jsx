import GigsClient from '../gigs/GigsClient'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { getSeoMeta, getSeoSchemas, getPageFaqs } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'gigs',
    fallback: {
      title: 'Performance Marketing Services | Google, Meta & TikTok Ads | Marketing by Prince',
      description: 'Performance marketing services across Google, Meta and TikTok, backed by tracking, attribution, conversion optimization and continuous campaign management.',
      path: '/pricing',
    },
  })
}

export default async function Page() {
  const [graph, faqs] = await Promise.all([
    getSeoSchemas({ contentType: 'gigs' }),
    getPageFaqs('gigs'),
  ])
  return (
    <>
      <SchemaScript schemas={graph} />
      <GigsClient />
      <FaqSection faqs={faqs} />
    </>
  )
}
