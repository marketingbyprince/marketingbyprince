import StaticPage from '@/components/sections/StaticPage'
import { getStaticPageMetadata } from '@/lib/pages'

export async function generateMetadata() {
  return getStaticPageMetadata('privacy', 'Privacy Policy | Marketing By Prince')
}

export default function Page() {
  return <StaticPage slug="privacy" fallbackTitle="Privacy Policy" />
}
