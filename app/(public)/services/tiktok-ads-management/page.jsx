import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { getSeoMeta, getSeoSchemas, getPageFaqs, buildBreadcrumbSchema, buildServiceSchema } from '@/lib/seo'

const SERVICE_NAME = 'TikTok Ads Management'
const URL = 'https://marketingbyprince.com/services/tiktok-ads-management'

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
  const [graph, faqs] = await Promise.all([
    getSeoSchemas({
      contentType: 'service-tiktok-ads-management',
      extraNodes: [breadcrumb, service],
    }),
    getPageFaqs('service-tiktok-ads-management'),
  ])

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
        related={[
          { label: 'Meta Ads Management', href: '/services/meta-ads-management' },
          { label: 'Landing Page & CRO', href: '/services/landing-page-cro' },
        ]}
      />
      <FaqSection faqs={faqs} />
    </>
  )
}
