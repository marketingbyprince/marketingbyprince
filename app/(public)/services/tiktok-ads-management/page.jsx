import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema, buildServiceSchema, buildFaqPageSchema } from '@/lib/seo'

const SERVICE_NAME = 'TikTok Ads Management'
const URL = 'https://marketingbyprince.com/services/tiktok-ads-management'

const FAQS = [
  {
    q: 'Does TikTok Ads work outside of consumer products?',
    a: 'It works best for brands that can produce native, attention-grabbing creative. It tends to suit eCommerce, DTC and consumer-facing brands more than traditional B2B.',
  },
  {
    q: 'Do you produce the creative or just run the campaigns?',
    a: 'I manage strategy, targeting, campaign structure and testing. Creative can be sourced from your existing content, UGC creators or a production partner, depending on what you already have.',
  },
  {
    q: 'How is TikTok Ads different from Meta Ads?',
    a: 'The audience behavior and creative style are different. TikTok rewards native, fast-paced content over polished ads, so campaign structure and testing cadence are built around that.',
  },
  {
    q: 'What is a realistic timeline to see results?',
    a: 'Early weeks are about testing creative and audiences. Meaningful, repeatable results typically take a few weeks of testing before scaling budget with confidence.',
  },
]

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'service-tiktok-ads-management',
    fallback: {
      title: 'TikTok Ads Management | Prince Pandey, Performance Marketer',
      description: 'TikTok Ads management built around creative testing and conversion tracking, turning attention into measurable acquisition.',
      path: '/services/tiktok-ads-management',
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
    description: 'TikTok Ads management covering creative testing, prospecting, retargeting and conversion tracking.',
    url: URL,
  })
  const faqSchema = buildFaqPageSchema(FAQS.map(f => ({ q: f.q, a: f.a })), { id: `${URL}#faq` })
  const graph = await getSeoSchemas({
    contentType: 'service-tiktok-ads-management',
    extraNodes: [breadcrumb, service, faqSchema],
  })

  return (
    <>
      <SchemaScript schemas={graph} />
      <ServiceLandingPage
        serviceName={SERVICE_NAME}
        eyebrow="TikTok Ads Management"
        h1="TikTok Ads Management"
        intro="I manage TikTok Ads for brands that want to turn attention into measurable acquisition, not just views. This is built for businesses that can produce or source native creative and want that creative tested properly."
        whoFor={[
          'You sell a consumer product or service that suits short-form, native video content.',
          'You have creative assets or access to UGC-style content but no one managing the media buying.',
          'You have tried TikTok Ads and could not tell which creative or audience was actually working.',
          'You want conversion tracking connected to TikTok from the start, not added later.',
        ]}
        included={[
          'Account setup or audit, including pixel and events API configuration.',
          'Campaign structure across prospecting, retargeting and lookalike audiences.',
          'Creative testing framework to identify which hooks, formats and angles perform.',
          'Conversion tracking setup so results are measured past the click.',
          'Budget allocation based on creative and audience performance, not guesswork.',
          'Weekly monitoring of creative fatigue and audience saturation.',
          'Monthly reporting on cost per result and creative-level performance.',
        ]}
        faqs={FAQS}
        related={[
          { label: 'Meta Ads Management', href: '/services/meta-ads-management' },
          { label: 'Landing Page & CRO', href: '/services/landing-page-cro' },
        ]}
      />
    </>
  )
}
