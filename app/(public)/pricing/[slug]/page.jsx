import GigDetailClient from '../../gigs/[slug]/GigDetailClient'
import SchemaScript from '@/components/SchemaScript'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema } from '@/lib/seo'

async function getGig(slugOrId) {
  const { data: bySlug } = await supabase.from('gigs').select('id, title, short_description').eq('slug', slugOrId).single()
  if (bySlug) return bySlug
  const { data: byId } = await supabase.from('gigs').select('id, title, short_description').eq('id', slugOrId).single()
  return byId
}

export async function generateMetadata({ params }) {
  const gig = await getGig(params.slug)
  return getSeoMeta({
    contentType: 'gig',
    contentId: gig?.id ?? null,
    fallback: {
      title: `${gig?.title || 'Pricing'} | Marketing By Prince`,
      description: gig?.short_description?.slice(0, 160),
      path: `/pricing/${params.slug}`,
    },
  })
}

export default async function Page({ params }) {
  const gig = await getGig(params.slug)
  const schemas = gig ? await getSeoSchemas({ contentType: 'gig', contentId: gig.id }) : []

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://marketingbyprince.com' },
    { name: 'Pricing', url: 'https://marketingbyprince.com/pricing' },
    { name: gig?.title || 'Pricing', url: `https://marketingbyprince.com/pricing/${params.slug}` },
  ])

  return (
    <>
      <SchemaScript schemas={[breadcrumb, ...schemas]} />
      <GigDetailClient params={params} />
    </>
  )
}
