import BlogClient from './BlogClient'
import { getSeoMeta } from '@/lib/seo'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'blogs',
    fallback: {
      title: 'Digital Marketing Blog | Performance Marketing Insights',
      description: 'Expert insights on PPC, Meta Ads, SEO, CRO and performance marketing strategies by Prince Pandey.',
      path: '/blog',
    },
  })
}

export default function Page() {
  return <BlogClient />
}
