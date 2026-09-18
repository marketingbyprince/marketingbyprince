import ContactClient from './ContactClient'
import { getSeoMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'contact',
    fallback: {
      title: 'Contact Prince Pandey | Free Marketing Consultation',
      description: 'Get a free consultation. Performance marketing, PPC & SEO services. Response within 24 hours.',
      path: '/contact',
    },
  })
}

export default function Page() {
  return <ContactClient />
}
