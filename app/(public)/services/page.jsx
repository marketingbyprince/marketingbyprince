import { Suspense } from 'react'
import ServicesClient from './ServicesClient'
import { getSeoMeta } from '@/lib/seo'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'services',
    fallback: {
      title: 'Digital Marketing Services | PPC, Meta Ads, SEO | Prince Pandey',
      description: 'Performance marketing services: Google Ads, Meta Ads, SEO, CRO & LinkedIn Ads. Transparent pricing, proven results.',
      path: '/services',
    },
  })
}

export default function Page() {
  return (
    <Suspense>
      <ServicesClient />
    </Suspense>
  )
}
