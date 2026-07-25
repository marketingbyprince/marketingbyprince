import ServiceDetailClient from './ServiceDetailClient'
import SchemaScript from '@/components/SchemaScript'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema } from '@/lib/seo'

async function getService(slug) {
  const { data } = await supabase.from('services').select('id, title, description, slug').eq('slug', slug).single()
  return data
}

export async function generateMetadata({ params }) {
  const service = await getService(params.slug)
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
  const service = await getService(params.slug)
  const schemas = service ? await getSeoSchemas({ contentType: 'service', contentId: service.id }) : []

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://marketingbyprince.com' },
    { name: 'Services', url: 'https://marketingbyprince.com/services' },
    { name: service?.title || 'Service', url: `https://marketingbyprince.com/services/${params.slug}` },
  ])

  return (
    <>
      <SchemaScript schemas={[breadcrumb, ...schemas]} />
      <ServiceDetailClient params={params} />
    </>
  )
}
