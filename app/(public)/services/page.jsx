import { Suspense } from 'react'
import ServicesClient from './ServicesClient'

export const metadata = {
  title: 'Digital Marketing Services | PPC, Meta Ads, SEO | Prince Pandey',
  description: 'Performance marketing services: Google Ads, Meta Ads, SEO, CRO & LinkedIn Ads. Transparent pricing, proven results.',
  alternates: { canonical: 'https://marketingbyprince.com/services' },
}

export default function Page() {
  return (
    <Suspense>
      <ServicesClient />
    </Suspense>
  )
}
