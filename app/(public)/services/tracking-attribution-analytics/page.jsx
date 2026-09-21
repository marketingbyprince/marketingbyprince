import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema, buildServiceSchema, buildFaqPageSchema } from '@/lib/seo'

const SERVICE_NAME = 'Tracking, Attribution & Analytics'
const URL = 'https://marketingbyprince.com/services/tracking-attribution-analytics'

const FAQS = [
  {
    q: 'What is server-side tracking and do I need it?',
    a: 'Server-side tracking sends conversion data from your server instead of only the browser, so it holds up better against ad blockers and browser privacy limits. Most businesses running meaningful ad spend benefit from it.',
  },
  {
    q: 'Do you set up GA4 from scratch?',
    a: 'Yes. I can build a new GA4 property and Google Tag Manager container, or audit and repair an existing setup that is missing events or double counting conversions.',
  },
  {
    q: 'What is CAPI and which platforms support it?',
    a: 'Conversions API (CAPI) sends conversion events directly from your server to the ad platform. Meta and TikTok both support it, and it is one of the most reliable ways to improve tracking accuracy.',
  },
  {
    q: 'Can you fix tracking that another agency set up?',
    a: 'Yes. Auditing and repairing an existing tracking setup is a common starting point, especially when reported numbers do not match what is actually happening in your business.',
  },
]

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'service-tracking-attribution-analytics',
    fallback: {
      title: 'Tracking, Attribution & Analytics | Prince Pandey, Performance Marketer',
      description: 'GA4, Google Tag Manager and server-side tracking setup so your ad decisions are based on what actually happened after the click.',
      path: '/services/tracking-attribution-analytics',
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
    description: 'GA4, Google Tag Manager and server-side conversion tracking setup for paid media accounts.',
    url: URL,
  })
  const faqSchema = buildFaqPageSchema(FAQS.map(f => ({ q: f.q, a: f.a })), { id: `${URL}#faq` })
  const graph = await getSeoSchemas({
    contentType: 'service-tracking-attribution-analytics',
    extraNodes: [breadcrumb, service, faqSchema],
  })

  return (
    <>
      <SchemaScript schemas={graph} />
      <ServiceLandingPage
        serviceName={SERVICE_NAME}
        eyebrow="Tracking, Attribution & Analytics"
        h1="Tracking, Attribution & Analytics Setup"
        intro="I build and repair the tracking foundation that paid media depends on. This is for businesses that cannot fully trust their reported conversions or are scaling ad spend on data that has never been properly checked."
        whoFor={[
          'Your ad platforms and GA4 report different numbers and you do not know which one to trust.',
          'You are about to scale ad spend and want tracking checked before you do.',
          'You have never set up server-side tracking or Conversions API.',
          'A previous agency or developer set up tracking and left, and no one has looked at it since.',
        ]}
        included={[
          'Full tracking audit across GA4, Google Tag Manager and ad platform pixels.',
          'GA4 property and event setup aligned to your actual conversion actions.',
          'Server-side tracking and Conversions API setup for Meta and TikTok where relevant.',
          'Google Ads and Meta pixel implementation and conversion action configuration.',
          'Attribution review so you understand which channels are actually driving results.',
          'CRM or backend integration for lead quality and revenue tracking where applicable.',
          'Documentation of the final setup so your team knows what was built and why.',
        ]}
        faqs={FAQS}
        related={[
          { label: 'PPC & Ad Account Audit', href: '/services/ppc-audit' },
          { label: 'Landing Page & CRO', href: '/services/landing-page-cro' },
        ]}
      />
    </>
  )
}
