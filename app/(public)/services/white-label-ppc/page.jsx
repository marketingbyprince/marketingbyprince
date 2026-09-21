import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { getSeoMeta, getSeoSchemas, getPageFaqs, buildBreadcrumbSchema, buildServiceSchema } from '@/lib/seo'

const SERVICE_NAME = 'White-Label PPC for Agencies'
const URL = 'https://marketingbyprince.com/services/white-label-ppc'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'service-white-label-ppc',
    fallback: {
      title: 'White-Label PPC for Agencies | Prince Pandey, Performance Marketer',
      description: 'White-label PPC execution for agencies across Google, Meta, LinkedIn and TikTok Ads, delivered under your brand.',
      path: '/services/white-label-ppc',
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
    description: 'White-label PPC campaign management for agencies, delivered under the agency brand across Google, Meta, LinkedIn and TikTok Ads.',
    url: URL,
  })
  const [graph, faqs] = await Promise.all([
    getSeoSchemas({
      contentType: 'service-white-label-ppc',
      extraNodes: [breadcrumb, service],
    }),
    getPageFaqs('service-white-label-ppc'),
  ])

  return (
    <>
      <SchemaScript schemas={graph} />
      <ServiceLandingPage
        serviceName={SERVICE_NAME}
        eyebrow="White-Label PPC"
        h1="White-Label PPC for Agencies"
        intro="I manage PPC campaigns behind the scenes for agencies that need experienced execution without hiring in-house. Your agency stays the face of the relationship, I handle the accounts."
        whoFor={[
          'Your agency sells PPC services but does not have enough in-house capacity to deliver them.',
          'You need an experienced hand on complex accounts without a long hiring process.',
          'You want consistent, senior-level execution across client accounts, not junior guesswork.',
          'You are scaling client work faster than your internal team can keep up with.',
        ]}
        included={[
          'Campaign management across Google, Meta, LinkedIn or TikTok Ads under your agency brand.',
          'Account audits for new or incoming client accounts.',
          'Conversion tracking setup and repair for client accounts.',
          'Ongoing optimization: bids, budgets, creative and targeting.',
          'Reporting formatted to match your existing agency client deliverables.',
          'Direct communication with your team, not your clients, unless you prefer otherwise.',
          'Flexible capacity that scales with how many accounts you bring on.',
        ]}
        related={[
          { label: 'PPC & Ad Account Audit', href: '/services/ppc-audit' },
          { label: 'Google Ads Management', href: '/services/google-ads-management' },
        ]}
      />
      <FaqSection faqs={faqs} />
    </>
  )
}
