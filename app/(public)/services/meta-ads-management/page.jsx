import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import SchemaScript from '@/components/SchemaScript'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema, buildServiceSchema, buildFaqPageSchema } from '@/lib/seo'

const SERVICE_NAME = 'Meta Ads Management'
const URL = 'https://marketingbyprince.com/services/meta-ads-management'

const FAQS = [
  {
    q: 'Do you manage both Facebook and Instagram?',
    a: 'Yes. Meta Ads Management covers Facebook and Instagram placements from one account, with budget and creative allocated based on what each platform actually delivers for you.',
  },
  {
    q: 'What creative formats do you test?',
    a: 'Static images, carousels, video and UGC-style creative, tested against each other so decisions are based on results, not personal preference.',
  },
  {
    q: 'How do you handle iOS tracking limitations?',
    a: 'Through server-side tracking and the Conversions API where appropriate, so your reported results are closer to what actually happened after the click.',
  },
  {
    q: 'Is this only for eCommerce brands?',
    a: 'No. Meta Ads works for eCommerce, lead generation and app installs. The campaign structure and creative strategy change depending on the goal.',
  },
]

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'service-meta-ads-management',
    fallback: {
      title: 'Meta Ads Management | Prince Pandey, Performance Marketer',
      description: 'Facebook and Instagram Ads management focused on creative testing, tracking and profitable scaling, not just reach and impressions.',
      path: '/services/meta-ads-management',
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
    description: 'Facebook and Instagram Ads management, including creative testing, targeting and conversion tracking.',
    url: URL,
  })
  const faqSchema = buildFaqPageSchema(FAQS.map(f => ({ q: f.q, a: f.a })), { id: `${URL}#faq` })
  const graph = await getSeoSchemas({
    contentType: 'service-meta-ads-management',
    extraNodes: [breadcrumb, service, faqSchema],
  })

  return (
    <>
      <SchemaScript schemas={graph} />
      <ServiceLandingPage
        serviceName={SERVICE_NAME}
        eyebrow="Meta Ads Management"
        h1="Meta Ads Management (Facebook & Instagram)"
        intro="I run Facebook and Instagram Ads for brands that need paid social to actually convert, not just generate likes. This is for businesses that want prospecting, retargeting and creative testing managed as one connected system."
        whoFor={[
          'You are spending on Facebook or Instagram Ads but cannot tell what is actually driving sales.',
          'You need a prospecting and retargeting structure that does not compete with itself.',
          'Your creative has gone stale and results are declining.',
          'You want server-side tracking so your numbers hold up after iOS privacy changes.',
        ]}
        included={[
          'Account audit covering campaign structure, audiences, placements and creative fatigue.',
          'Pixel and Conversions API setup for accurate, server-side tracking.',
          'Prospecting and retargeting campaign structure built around your funnel.',
          'Creative testing across static, carousel, video and UGC-style formats.',
          'Audience and placement testing to find where your budget performs best.',
          'Weekly optimization of budgets, bids and creative rotation.',
          'Monthly reporting on ROAS, cost per result and creative performance.',
        ]}
        faqs={FAQS}
        related={[
          { label: 'Google Ads Management', href: '/services/google-ads-management' },
          { label: 'Landing Page & CRO', href: '/services/landing-page-cro' },
        ]}
      />
    </>
  )
}
