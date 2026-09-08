import GigsClient from '../gigs/GigsClient'
import { getSeoMeta } from '@/lib/seo'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'gigs',
    fallback: {
      title: 'Performance Marketing Services | Google, Meta & TikTok Ads | Marketing by Prince',
      description: 'Performance marketing services across Google, Meta and TikTok, backed by tracking, attribution, conversion optimization and continuous campaign management.',
      path: '/pricing',
    },
  })
}

export default function Page() {
  return <GigsClient />
}
