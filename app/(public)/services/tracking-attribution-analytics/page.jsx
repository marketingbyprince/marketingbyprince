import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { getSeoMeta, getSeoSchemas, getPageFaqs, buildBreadcrumbSchema, buildServiceSchema } from '@/lib/seo'

const SERVICE_NAME = 'Tracking, Attribution & Analytics'
const URL = 'https://marketingbyprince.com/services/tracking-attribution-analytics'

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
  const [graph, faqs] = await Promise.all([
    getSeoSchemas({
      contentType: 'service-tracking-attribution-analytics',
      extraNodes: [breadcrumb, service],
    }),
    getPageFaqs('service-tracking-attribution-analytics'),
  ])

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
        related={[
          { label: 'PPC & Ad Account Audit', href: '/services/ppc-audit' },
          { label: 'Landing Page & CRO', href: '/services/landing-page-cro' },
        ]}
      />
      <FaqSection faqs={faqs} />
    </>
  )
}
