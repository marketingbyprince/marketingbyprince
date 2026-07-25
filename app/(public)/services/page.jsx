import { Suspense } from 'react'
import ServicesClient from './ServicesClient'
import { getSeoMeta } from '@/lib/seo'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'services',
    fallback: {
      title: 'Performance Marketing & Digital Growth Services | Prince Pandey',
      description: 'Performance marketing at the core — backed by SEO, marketplace growth, website & app development, and automation. Transparent pricing, proven results.',
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
