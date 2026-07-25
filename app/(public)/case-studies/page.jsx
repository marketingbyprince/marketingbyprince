import CaseStudiesClient from './CaseStudiesClient'
import { getSeoMeta } from '@/lib/seo'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'case_studies',
    fallback: {
      title: 'Case Studies | Real Results | Prince Pandey',
      description: 'Real campaigns, real results. See how I\'ve helped brands scale with performance marketing, SEO, and growth strategies.',
      path: '/case-studies',
    },
  })
}

export default function Page() {
  return <CaseStudiesClient />
}
