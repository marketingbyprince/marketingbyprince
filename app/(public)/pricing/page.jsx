import GigsClient from '../gigs/GigsClient'
import { getSeoMeta } from '@/lib/seo'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'gigs',
    fallback: {
      title: 'Pricing & Packages | Performance Marketing Services | Prince Pandey',
      description: 'Transparent pricing packages for performance marketing, SEO, tracking setup and more. Fixed-scope deliverables with expert execution.',
      path: '/pricing',
    },
  })
}

export default function Page() {
  return <GigsClient />
}
