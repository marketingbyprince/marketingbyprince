import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { getSeoMeta, getSeoSchemas, getPageFaqs, buildBreadcrumbSchema, buildServiceSchema } from '@/lib/seo'

const SERVICE_NAME = 'LinkedIn Ads Management'
const URL = 'https://marketingbyprince.com/services/linkedin-ads-management'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'service-linkedin-ads-management',
    fallback: {
      title: 'LinkedIn Ads Management | Prince Pandey, Performance Marketer',
      description: 'B2B LinkedIn Ads management built around precise targeting, lead quality and cost per lead, not just impressions.',
      path: '/services/linkedin-ads-management',
    },
  })
}

export const dynamic = 'force-dynamic'

export default async function Page() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://marketingbyprince.com' },
    { name: 'Services', url: 'https://marketingbyprince.com/services' },
    { name: SERVICE_NAME, url: URL },
  ])
  const service = buildServiceSchema({
    id: `${URL}#service`,
    name: SERVICE_NAME,
    description: 'B2B LinkedIn Ads management covering Sponsored Content, Message Ads and lead generation campaigns.',
    url: URL,
  })
  const [graph, faqs] = await Promise.all([
    getSeoSchemas({
      contentType: 'service-linkedin-ads-management',
      extraNodes: [breadcrumb, service],
    }),
    getPageFaqs('service-linkedin-ads-management'),
  ])

  return (
    <>
      <SchemaScript schemas={graph} />
      <ServiceLandingPage
        serviceName={SERVICE_NAME}
        eyebrow="LinkedIn Ads Management"
        h1="LinkedIn Ads Management for B2B"
        intro="I manage LinkedIn Ads for B2B companies that need to reach a specific job title, industry or company size and turn that reach into qualified leads. This is built for sales cycles where the wrong lead costs more than a missed one."
        whoFor={[
          'You sell to a specific job title, industry or company size that LinkedIn can target precisely.',
          'Your sales cycle is long enough that lead quality matters more than lead volume.',
          'You have tried LinkedIn Ads before and the cost per lead felt out of control.',
          'You need lead generation that plugs into your existing CRM or sales process.',
        ]}
        included={[
          'Audience research and targeting built around job title, seniority, industry and company size.',
          'Campaign structure across Sponsored Content, Message Ads and lead generation forms.',
          'Ad copy and creative built for a professional, decision-maker audience.',
          'Lead form and landing page alignment to reduce drop-off.',
          'Conversion tracking connected to your CRM or lead pipeline.',
          'Ongoing exclusion of underperforming audiences and placements.',
          'Monthly reporting on cost per lead, lead quality signals and pipeline impact.',
        ]}
        related={[
          { label: 'Google Ads Management', href: '/services/google-ads-management' },
          { label: 'PPC & Ad Account Audit', href: '/services/ppc-audit' },
        ]}
      />
      <FaqSection faqs={faqs} />
    </>
  )
}
