import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema, buildServiceSchema, buildFaqPageSchema } from '@/lib/seo'

const SERVICE_NAME = 'Google Ads Management'
const URL = 'https://marketingbyprince.com/services/google-ads-management'

const FAQS = [
  {
    q: 'Which Google Ads campaign types do you manage?',
    a: 'Search, Performance Max, Shopping, Display and YouTube, depending on where your customers actually are and what the account economics support.',
  },
  {
    q: 'Do you work with new accounts or only existing ones?',
    a: 'Both. A new account gets built from scratch with proper conversion tracking from day one. An existing account gets audited first, then restructured where it makes sense.',
  },
  {
    q: 'How do you decide how much budget to spend?',
    a: 'Budget follows what the account can profitably absorb, based on your target CPA or ROAS, not a fixed percentage or a guess.',
  },
  {
    q: 'How is Google Ads Management different from a general PPC audit?',
    a: 'A PPC audit is a one-time review with a report. Google Ads Management is ongoing, hands-on work: building, testing and optimizing the account week over week.',
  },
]

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
  const faqSchema = buildFaqPageSchema(FAQS.map(f => ({ q: f.q, a: f.a })), { id: `${URL}#faq` })
  const graph = await getSeoSchemas({
    contentType: 'service-google-ads-management',
    extraNodes: [breadcrumb, service, faqSchema],
  })

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
        faqs={FAQS}
        related={[
          { label: 'Meta Ads Management', href: '/services/meta-ads-management' },
          { label: 'Tracking & Analytics', href: '/services/tracking-attribution-analytics' },
        ]}
      />
    </>
  )
}
