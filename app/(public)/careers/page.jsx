import StaticPage from '@/components/sections/StaticPage'
import { getStaticPageMetadata } from '@/lib/pages'

export async function generateMetadata() {
  return getStaticPageMetadata('careers', 'Careers | Marketing By Prince')
}

export default function Page() {
  return <StaticPage slug="careers" fallbackTitle="Careers" />
}
