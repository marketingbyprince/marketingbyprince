import HomeClient from './HomeClient'
import PageRenderer from '@/components/sections/PageRenderer'
import { getPageWithSections } from '@/lib/pages'
import { getSeoMeta } from '@/lib/seo'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'homepage',
    fallback: {
      title: 'Performance Marketing Consultant India | Prince Pandey',
      description: 'Results-driven PPC, Meta Ads, SEO & CRO services. 40+ clients, 3-5x ROAS. Based in Panchkula, serving pan-India.',
      path: '/',
    },
  })
}

export default async function Page() {
  const page = await getPageWithSections('home')

  // Falls back to the legacy hardcoded homepage if the page-builder row
  // isn't present yet (e.g. migration not run in this environment).
  if (!page || page.sections.length === 0) return <HomeClient />

  return <PageRenderer sections={page.sections} faqsBySection={page.faqsBySection} />
}
