import ServiceDetailClient from './ServiceDetailClient'

export async function generateMetadata({ params }) {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: service } = await supabase
      .from('services')
      .select('name, description, slug')
      .eq('slug', params.slug)
      .single()
    return {
      title: `${service?.name || 'Service'} | Marketing By Prince`,
      description: service?.description?.slice(0, 160),
      alternates: { canonical: `https://marketingbyprince.com/services/${params.slug}` },
    }
  } catch {
    return { title: 'Service | Marketing By Prince' }
  }
}

export default function Page({ params }) {
  return <ServiceDetailClient params={params} />
}
