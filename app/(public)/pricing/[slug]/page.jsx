import GigDetailClient from '../../gigs/[slug]/GigDetailClient'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, getPageFaqs, buildBreadcrumbSchema } from '@/lib/seo'

const TIER_ORDER = ['starter', 'standard', 'premium']

async function getGigDetail(slugOrId) {
  let { data: gig } = await supabase.from('gigs').select('*').eq('slug', slugOrId).single()
  if (!gig) {
    const { data: byId } = await supabase.from('gigs').select('*').eq('id', slugOrId).single()
    gig = byId
  }
  if (!gig) return { gig: null, packages: [], addons: [], platforms: [] }

  const gigId = gig.id
  const [{ data: pkgs }, { data: ads }, { data: plats }] = await Promise.all([
    supabase.from('gig_packages').select('*').eq('gig_id', gigId).eq('is_active', true),
    supabase.from('gig_addons').select('*').eq('gig_id', gigId).eq('is_active', true).order('sort_order'),
    supabase.from('platforms').select('*').eq('is_active', true).order('sort_order'),
  ])

  const packages = (pkgs || []).sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))
  const allowedIds = gig.allowed_platform_ids
  const platforms = (allowedIds && allowedIds.length > 0)
    ? (plats || []).filter(p => allowedIds.includes(p.id))
    : (plats || [])

  return { gig, packages, addons: ads || [], platforms }
}

export async function generateMetadata({ params }) {
  const { gig } = await getGigDetail(params.slug)
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
  const detail = await getGigDetail(params.slug)

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://marketingbyprince.com' },
    { name: 'Pricing', url: 'https://marketingbyprince.com/pricing' },
    { name: detail.gig?.title || 'Pricing', url: `https://marketingbyprince.com/pricing/${params.slug}` },
  ])
  const [graph, faqs] = await Promise.all([
    getSeoSchemas({ contentType: 'gig', contentId: detail.gig?.id ?? null, extraNodes: [breadcrumb] }),
    getPageFaqs('gig', detail.gig?.id ?? null),
  ])

  return (
    <>
      <SchemaScript schemas={graph} />
      <GigDetailClient params={params} initial={detail} />
      <FaqSection faqs={faqs} />
    </>
  )
}
