import CaseStudiesClient from './CaseStudiesClient'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, getPageFaqs } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const LIGHT_FIELDS = 'id, slug, title, client_name, industry, channel, summary, cover_image_url, key_metrics, is_featured, sort_order, created_at'

async function getCaseStudies() {
  const { data } = await supabase.from('case_studies').select(LIGHT_FIELDS).eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  return data || []
}

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'case_studies',
    fallback: {
      title: 'Case Studies | Real Results | Prince Pandey',
      description: 'Real campaigns, real results. See how I\'ve helped brands scale with performance marketing, SEO, and growth strategies.',
      path: '/case-studies',
    },
  })
}

export default async function Page() {
  const [cases, graph, faqs] = await Promise.all([
    getCaseStudies(),
    getSeoSchemas({ contentType: 'case_studies' }),
    getPageFaqs('case_studies'),
  ])
  return (
    <>
      <SchemaScript schemas={graph} />
      <CaseStudiesClient initialCases={cases} />
      <FaqSection faqs={faqs} />
    </>
  )
}
