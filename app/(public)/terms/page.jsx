import StaticPage from '@/components/sections/StaticPage'
import { getStaticPageMetadata } from '@/lib/pages'

export async function generateMetadata() {
  return getStaticPageMetadata('terms', 'Terms & Conditions | Marketing By Prince')
}

export default function Page() {
  return <StaticPage slug="terms" fallbackTitle="Terms & Conditions" />
}
