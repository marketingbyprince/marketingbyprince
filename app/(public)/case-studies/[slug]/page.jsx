import CaseStudyClient from './CaseStudyClient'
import SchemaScript from '@/components/SchemaScript'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema } from '@/lib/seo'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const LIGHT_FIELDS = 'id, slug, title, client_name, industry, channel, cover_image_url, key_metrics, sort_order, created_at'

async function getCaseStudyDetail(slugOrId) {
  const column = UUID_RE.test(slugOrId) ? 'id' : 'slug'
  const { data: cs } = await supabase.from('case_studies').select('*').eq(column, slugOrId).single()
  if (!cs) return { cs: null, ordered: [], others: [] }

  const { data: all } = await supabase.from('case_studies').select(LIGHT_FIELDS)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  const ordered = all || []
  return { cs, ordered, others: ordered.filter(o => o.id !== cs.id) }
}

export async function generateMetadata({ params }) {
  const { cs } = await getCaseStudyDetail(params.slug)
  return getSeoMeta({
    contentType: 'case_study',
    contentId: cs?.id ?? null,
    fallback: {
      title: `${cs?.title || 'Case Study'} | Marketing By Prince`,
      description: cs?.summary,
      path: `/case-studies/${params.slug}`,
    },
  })
}

export default async function Page({ params }) {
  const detail = await getCaseStudyDetail(params.slug)

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://marketingbyprince.com' },
    { name: 'Case Studies', url: 'https://marketingbyprince.com/case-studies' },
    { name: detail.cs?.title || 'Case Study', url: `https://marketingbyprince.com/case-studies/${params.slug}` },
  ])
  const graph = await getSeoSchemas({ contentType: 'case_study', contentId: detail.cs?.id ?? null, extraNodes: [breadcrumb] })

  return (
    <>
      <SchemaScript schemas={graph} />
      <CaseStudyClient initial={detail} />
    </>
  )
}
