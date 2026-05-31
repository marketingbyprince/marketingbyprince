import GigDetailClient from './GigDetailClient'

export async function generateMetadata({ params }) {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: gig } = await supabase
      .from('gigs')
      .select('title, description, slug')
      .eq('slug', params.slug)
      .single()
    return {
      title: `${gig?.title || 'Gig'} | Marketing By Prince`,
      description: gig?.description?.slice(0, 160),
      alternates: { canonical: `https://marketingbyprince.com/gigs/${params.slug}` },
    }
  } catch {
    return { title: 'Gig | Marketing By Prince' }
  }
}

export default function Page({ params }) {
  return <GigDetailClient params={params} />
}
