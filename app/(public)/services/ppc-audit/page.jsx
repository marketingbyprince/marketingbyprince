import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema, buildServiceSchema, buildFaqPageSchema } from '@/lib/seo'

const SERVICE_NAME = 'PPC & Ad Account Audit'
const URL = 'https://marketingbyprince.com/services/ppc-audit'

const FAQS = [
  {
    q: 'What platforms can you audit?',
    a: 'Google Ads, Meta Ads, LinkedIn Ads and TikTok Ads. The audit covers whichever platforms your business is actually running.',
  },
  {
    q: 'What do I get at the end of the audit?',
    a: 'A clear written report covering account structure, tracking accuracy, wasted spend and a prioritized list of what to fix first.',
  },
  {
    q: 'How long does an audit take?',
    a: 'Most audits are completed within a few business days once account access is granted, depending on how many platforms and how much account history there is to review.',
  },
  {
    q: 'Will you also implement the fixes?',
    a: 'The audit itself is a review and report. Implementation can be handled through ongoing management of the relevant platform if you decide to move forward.',
  },
]

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
  const faqSchema = buildFaqPageSchema(FAQS.map(f => ({ q: f.q, a: f.a })), { id: `${URL}#faq` })
  const graph = await getSeoSchemas({
    contentType: 'service-ppc-audit',
    extraNodes: [breadcrumb, service, faqSchema],
  })

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
        faqs={FAQS}
        related={[
          { label: 'Tracking & Analytics', href: '/services/tracking-attribution-analytics' },
          { label: 'White-Label PPC', href: '/services/white-label-ppc' },
        ]}
      />
    </>
  )
}
