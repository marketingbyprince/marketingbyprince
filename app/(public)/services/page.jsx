import { Suspense } from 'react'
import ServicesClient from './ServicesClient'
import { supabase } from '@/lib/supabase'
import { getSeoMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

async function getServices() {
  const { data } = await supabase
    .from('services')
    .select('id, title, description, pillar, icon, slug, is_active')
    .eq('is_active', true)
    .order('pillar')
  return data || []
}

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'services',
    fallback: {
      title: 'Performance Marketing & Digital Growth Services | Prince Pandey',
      description: 'Performance marketing at the core — backed by SEO, marketplace growth, website & app development, and automation. Transparent pricing, proven results.',
      path: '/services',
    },
  })
}

export default async function Page() {
  const services = await getServices()
  return (
    <Suspense>
      <ServicesClient initialServices={services} />
    </Suspense>
  )
}
