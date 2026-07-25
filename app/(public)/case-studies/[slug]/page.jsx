import CaseStudyClient from './CaseStudyClient'
import SchemaScript from '@/components/SchemaScript'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema } from '@/lib/seo'

async function getCaseStudy(id) {
  const { data } = await supabase.from('case_studies').select('id, title, challenge').eq('id', id).single()
  return data
}

export async function generateMetadata({ params }) {
  const cs = await getCaseStudy(params.slug)
  return getSeoMeta({
    contentType: 'case_study',
    contentId: cs?.id ?? null,
    fallback: {
      title: `${cs?.title || 'Case Study'} | Marketing By Prince`,
      description: cs?.challenge?.slice(0, 160),
      path: `/case-studies/${params.slug}`,
    },
  })
}

export default async function Page({ params }) {
  const cs = await getCaseStudy(params.slug)
  const schemas = cs ? await getSeoSchemas({ contentType: 'case_study', contentId: cs.id }) : []

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://marketingbyprince.com' },
    { name: 'Case Studies', url: 'https://marketingbyprince.com/case-studies' },
    { name: cs?.title || 'Case Study', url: `https://marketingbyprince.com/case-studies/${params.slug}` },
  ])

  return (
    <>
      <SchemaScript schemas={[breadcrumb, ...schemas]} />
      <CaseStudyClient params={params} />
    </>
  )
}
