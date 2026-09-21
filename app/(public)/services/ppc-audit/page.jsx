import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { getSeoMeta, getSeoSchemas, getPageFaqs, buildBreadcrumbSchema, buildServiceSchema } from '@/lib/seo'

const SERVICE_NAME = 'PPC & Ad Account Audit'
const URL = 'https://marketingbyprince.com/services/ppc-audit'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'service-ppc-audit',
    fallback: {
      title: 'PPC & Ad Account Audit | Prince Pandey, Performance Marketer',
      description: 'An independent audit of your Google, Meta, LinkedIn or TikTok ad account, covering tracking, structure and wasted spend.',
      path: '/services/ppc-audit',
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
    description: 'Independent audit of Google, Meta, LinkedIn or TikTok ad accounts, covering tracking, structure and spend efficiency.',
    url: URL,
  })
  const [graph, faqs] = await Promise.all([
    getSeoSchemas({
      contentType: 'service-ppc-audit',
      extraNodes: [breadcrumb, service],
    }),
    getPageFaqs('service-ppc-audit'),
  ])

  return (
    <>
      <SchemaScript schemas={graph} />
      <ServiceLandingPage
        serviceName={SERVICE_NAME}
        eyebrow="PPC & Ad Account Audit"
        h1="PPC & Ad Account Audit"
        intro="I review your existing Google, Meta, LinkedIn or TikTok account and tell you exactly what is working, what is wasting budget and what to fix first. This is an independent second opinion on an account someone else may have built."
        whoFor={[
          'You inherited an ad account and do not know if it is set up correctly.',
          'You want an independent review of an account your current agency or freelancer manages.',
          'You suspect budget is being wasted but cannot pinpoint where.',
          'You are deciding whether to keep managing ads in-house or bring in outside help.',
        ]}
        included={[
          'Account structure review across campaigns, ad groups and audiences.',
          'Tracking accuracy check, including conversion actions and event setup.',
          'Wasted spend analysis: irrelevant search terms, overlapping audiences, poor placements.',
          'Bidding and budget allocation review against your actual goals.',
          'Creative and ad copy review for relevance and fatigue.',
          'A prioritized action list ranked by expected impact.',
          'A findings call to walk through the report and answer questions.',
        ]}
        related={[
          { label: 'Tracking & Analytics', href: '/services/tracking-attribution-analytics' },
          { label: 'White-Label PPC', href: '/services/white-label-ppc' },
        ]}
      />
      <FaqSection faqs={faqs} />
    </>
  )
}
