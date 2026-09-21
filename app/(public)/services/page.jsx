import ServicesClient from './ServicesClient'
import { supabase } from '@/lib/supabase'
import { getSeoMeta } from '@/lib/seo'

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
  const performanceMarketingCard = await getPerformanceMarketingCard()
  return <ServicesClient performanceMarketingCard={performanceMarketingCard} />
}
