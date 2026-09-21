import ServicesClient from './ServicesClient'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, getPageFaqs } from '@/lib/seo'

export const dynamic = 'force-dynamic'

async function getPerformanceMarketingCard() {
  const { data } = await supabase
    .from('services')
    .select('id, title, description, pillar, icon, slug, is_active')
    .eq('slug', 'performance-marketing')
    .eq('is_active', true)
    .single()
  return data || null
}

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'services',
    fallback: {
      title: 'Performance Marketing Services | Prince Pandey',
      description: 'Paid media, tracking and conversion services across Google, Meta, LinkedIn and TikTok Ads. Focused on profitable growth, nothing else.',
      path: '/services',
    },
  })
}

export default async function Page() {
  const [performanceMarketingCard, graph, faqs] = await Promise.all([
    getPerformanceMarketingCard(),
    getSeoSchemas({ contentType: 'services' }),
    getPageFaqs('services'),
  ])
  return (
    <>
      <SchemaScript schemas={graph} />
      <ServicesClient performanceMarketingCard={performanceMarketingCard} />
      <FaqSection faqs={faqs} />
    </>
  )
}
