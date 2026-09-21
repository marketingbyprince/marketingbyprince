import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { getSeoMeta, getSeoSchemas, getPageFaqs, buildBreadcrumbSchema, buildServiceSchema } from '@/lib/seo'

const SERVICE_NAME = 'Google Ads Management'
const URL = 'https://marketingbyprince.com/services/google-ads-management'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'service-google-ads-management',
    fallback: {
      title: 'Google Ads Management | Prince Pandey, Performance Marketer',
      description: 'Google Ads management across Search, Performance Max, Shopping and YouTube, built around conversion tracking and profitable growth, not vanity clicks.',
      path: '/services/google-ads-management',
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
    description: 'Google Ads account management across Search, Performance Max, Shopping and YouTube.',
    url: URL,
  })
  const [graph, faqs] = await Promise.all([
    getSeoSchemas({
      contentType: 'service-google-ads-management',
      extraNodes: [breadcrumb, service],
    }),
    getPageFaqs('service-google-ads-management'),
  ])

  return (
    <>
      <SchemaScript schemas={graph} />
      <ServiceLandingPage
        serviceName={SERVICE_NAME}
        eyebrow="Google Ads Management"
        h1="Google Ads Management by Prince Pandey"
        intro="I manage Google Ads accounts for brands that want search intent turned into revenue, not just impressions. This is for businesses running Search, Shopping or Performance Max who need someone who owns the account end to end."
        whoFor={[
          'You have an existing Google Ads account that is spending money without a clear return.',
          'You are launching Google Ads for the first time and want it set up correctly from day one.',
          'You sell products or services people actively search for and want to capture that demand.',
          'You need conversion tracking you can actually trust before you scale spend.',
        ]}
        included={[
          'Full account audit: campaign structure, keywords, negative keywords, bidding and quality score.',
          'Conversion tracking setup or repair, including GA4 and offline conversion imports where relevant.',
          'Campaign build or restructure across Search, Performance Max, Shopping and YouTube.',
          'Keyword research and negative keyword lists to cut wasted spend.',
          'Ad copy and asset testing across headlines, descriptions and extensions.',
          'Weekly optimization: bids, budgets, search terms and audience signals.',
          'Monthly reporting tied to CPA, ROAS and revenue, not just clicks.',
        ]}
        related={[
          { label: 'Meta Ads Management', href: '/services/meta-ads-management' },
          { label: 'Tracking & Analytics', href: '/services/tracking-attribution-analytics' },
        ]}
      />
      <FaqSection faqs={faqs} />
    </>
  )
}
