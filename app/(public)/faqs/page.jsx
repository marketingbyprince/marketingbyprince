import StaticPage from '@/components/sections/StaticPage'
import { getStaticPageMetadata } from '@/lib/pages'

export async function generateMetadata() {
  return getStaticPageMetadata('faqs', 'FAQs | Marketing By Prince')
}

export default function Page() {
  return <StaticPage slug="faqs" fallbackTitle="FAQs" />
}
