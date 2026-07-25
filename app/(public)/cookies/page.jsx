import StaticPage from '@/components/sections/StaticPage'
import { getStaticPageMetadata } from '@/lib/pages'

export async function generateMetadata() {
  return getStaticPageMetadata('cookies', 'Cookie Policy | Marketing By Prince')
}

export default function Page() {
  return <StaticPage slug="cookies" fallbackTitle="Cookie Policy" />
}
