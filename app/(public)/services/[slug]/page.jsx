import ServiceDetailClient from './ServiceDetailClient'
import SchemaScript from '@/components/SchemaScript'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema } from '@/lib/seo'

const TIER_ORDER = ['starter', 'standard', 'premium', 'custom']

async function getServiceDetail(slug) {
  const { data: service } = await supabase.from('services').select('*').eq('slug', slug).eq('is_active', true).single()
  if (!service) return { service: null, packages: [], addons: [], platforms: [], related: [] }

  const [{ data: pkgs }, { data: ads }, { data: plats }, { data: rel }] = await Promise.all([
    supabase.from('service_packages').select('*').eq('service_id', service.id).eq('is_active', true),
    supabase.from('add_on_services').select('*').eq('service_id', service.id).eq('is_active', true).order('sort_order'),
    supabase.from('platforms').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    service.pillar
      ? supabase.from('services').select('id, title, description, icon, pillar, slug')
          .eq('pillar', service.pillar).eq('is_active', true).neq('id', service.id).limit(3)
      : Promise.resolve({ data: [] }),
  ])

  return {
    service,
    packages: (pkgs || []).sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)),
    addons: ads || [],
    platforms: plats || [],
    related: rel || [],
  }
}

export async function generateMetadata({ params }) {
  const { service } = await getServiceDetail(params.slug)
  return getSeoMeta({
    contentType: 'service',
    contentId: service?.id ?? null,
    fallback: {
      title: `${service?.title || 'Service'} | Marketing By Prince`,
      description: service?.description?.slice(0, 160),
      path: `/services/${params.slug}`,
    },
  })
}

export default async function Page({ params }) {
  const detail = await getServiceDetail(params.slug)
  const schemas = detail.service ? await getSeoSchemas({ contentType: 'service', contentId: detail.service.id }) : []

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://marketingbyprince.com' },
    { name: 'Services', url: 'https://marketingbyprince.com/services' },
    { name: detail.service?.title || 'Service', url: `https://marketingbyprince.com/services/${params.slug}` },
  ])

  return (
    <>
      <SchemaScript schemas={[breadcrumb, ...schemas]} />
      <ServiceDetailClient initial={detail} />
    </>
  )
}
