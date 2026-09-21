import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema, buildServiceSchema, buildFaqPageSchema } from '@/lib/seo'

const SERVICE_NAME = 'Landing Page & Conversion Rate Optimization'
const URL = 'https://marketingbyprince.com/services/landing-page-cro'

const FAQS = [
  {
    q: 'Do you build new landing pages or optimize existing ones?',
    a: 'Both. A new page can be built around a specific campaign and offer, or an existing page can be reviewed and improved based on where visitors are dropping off.',
  },
  {
    q: 'What tools do you use to find conversion problems?',
    a: 'Analytics data, session recordings and heatmaps where available, combined with a direct review of the page against the traffic source and offer.',
  },
  {
    q: 'How long does a CRO project take to show results?',
    a: 'A single landing page rebuild can be live within a couple of weeks. Ongoing CRO work is iterative and improves over multiple testing cycles.',
  },
  {
    q: 'Does this include copywriting and design?',
    a: 'Structure, messaging direction and conversion logic are part of the work. Final copywriting and visual design can be handled directly or coordinated with your existing designer or writer.',
  },
]

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'service-landing-page-cro',
    fallback: {
      title: 'Landing Page & CRO | Prince Pandey, Performance Marketer',
      description: 'Landing page build and conversion rate optimization so the traffic you already pay for converts more often.',
      path: '/services/landing-page-cro',
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
    description: 'Landing page build and conversion rate optimization for paid traffic campaigns.',
    url: URL,
  })
  const faqSchema = buildFaqPageSchema(FAQS.map(f => ({ q: f.q, a: f.a })), { id: `${URL}#faq` })
  const graph = await getSeoSchemas({
    contentType: 'service-landing-page-cro',
    extraNodes: [breadcrumb, service, faqSchema],
  })

  return (
    <>
      <SchemaScript schemas={graph} />
      <ServiceLandingPage
        serviceName={SERVICE_NAME}
        eyebrow="Landing Page & CRO"
        h1="Landing Page & Conversion Rate Optimization"
        intro="I build and improve the page your ad traffic lands on, so the clicks you already pay for convert more often. This is for businesses sending traffic to a page that is not pulling its weight."
        whoFor={[
          'Your ad campaigns look healthy but the landing page conversion rate is low.',
          'You are sending paid traffic to your homepage or a generic page instead of a dedicated landing page.',
          'You want a new landing page built for a specific offer or campaign.',
          'You have traffic data but no one has reviewed the page against it.',
        ]}
        included={[
          'Landing page audit against your traffic source, offer and current conversion rate.',
          'New landing page build aligned to a specific campaign, offer or audience.',
          'Messaging and structure review to reduce friction between the ad and the offer.',
          'Mobile experience review, since most paid traffic lands on a phone.',
          'Form, checkout or lead capture review to reduce drop-off.',
          'Test plan for headlines, layout and calls to action.',
          'Reporting on conversion rate changes tied back to campaign performance.',
        ]}
        faqs={FAQS}
        related={[
          { label: 'Tracking & Analytics', href: '/services/tracking-attribution-analytics' },
          { label: 'Google Ads Management', href: '/services/google-ads-management' },
        ]}
      />
    </>
  )
}
