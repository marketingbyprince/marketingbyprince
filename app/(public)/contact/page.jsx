import ContactClient from './ContactClient'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { getSeoMeta, getSeoSchemas, getPageFaqs } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'contact',
    fallback: {
      title: 'Contact Prince Pandey | Free Marketing Consultation',
      description: 'Get a free consultation on Google, Meta, LinkedIn or TikTok Ads management. Response within 24 hours.',
      path: '/contact',
    },
  })
}

export default async function Page() {
  const [graph, faqs] = await Promise.all([
    getSeoSchemas({ contentType: 'contact' }),
    getPageFaqs('contact'),
  ])
  return (
    <>
      <SchemaScript schemas={graph} />
      <ContactClient />
      <FaqSection faqs={faqs} />
    </>
  )
}
