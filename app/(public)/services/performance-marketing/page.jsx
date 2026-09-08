import PerformanceMarketingContent from './PerformanceMarketingContent'
import SchemaScript from '@/components/SchemaScript'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema } from '@/lib/seo'

const RESULT_SLUGS = [
  'tech-trade-group-google-ads',
  'zebra-effect-meta-ads',
  'citedevidence-ai-meta-ads',
  'athens-residents-meta-lead-gen',
]

async function getResultCaseStudies() {
  const { data } = await supabase
    .from('case_studies')
    .select('slug, client_name, industry, channel')
    .eq('is_published', true)
    .in('slug', RESULT_SLUGS)
  return data || []
}

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'performance-marketing-service',
    fallback: {
      title: 'Performance Marketing Services | Google, Meta & TikTok Ads | Marketing by Prince',
      description: 'Performance marketing built around measurable growth. Google, Meta and TikTok advertising backed by tracking, attribution, CRO and continuous optimization.',
      path: '/services/performance-marketing',
    },
  })
}

export default async function Page() {
  const [caseStudies, schemas] = await Promise.all([
    getResultCaseStudies(),
    getSeoSchemas({ contentType: 'performance-marketing-service' }),
  ])

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://marketingbyprince.com' },
    { name: 'Services', url: 'https://marketingbyprince.com/services' },
    { name: 'Performance Marketing', url: 'https://marketingbyprince.com/services/performance-marketing' },
  ])

  return (
    <>
      <SchemaScript schemas={[breadcrumb, ...schemas]} />
      <PerformanceMarketingContent caseStudies={caseStudies} />
    </>
  )
}
