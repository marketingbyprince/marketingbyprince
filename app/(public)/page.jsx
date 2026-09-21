import HomeClient from './HomeClient'
import PageRenderer from '@/components/sections/PageRenderer'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { getPageWithSections } from '@/lib/pages'
import { getSeoMeta, getSeoSchemas, getPageFaqs } from '@/lib/seo'
import { supabase } from '@/lib/supabase'

// Ensures admin edits (SEO Center, hero slides, homepage services) show up
// immediately without needing a redeploy.
export const dynamic = 'force-dynamic'

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

async function getHomeFallbackData() {
  const now = new Date().toISOString()
  const [{ data: heroSlides }, { data: services }] = await Promise.all([
    supabase
      .from('hero_slides')
      .select('id,image_url,alt_text,display_order')
      .eq('is_active', true)
      .lte('start_date', now)
      .or('end_date.is.null,end_date.gte.' + now)
      .order('display_order', { ascending: true }),
    supabase
      .from('services')
      .select('id,title,description,cta_link')
      .eq('is_active', true)
      .eq('show_on_homepage', true)
      .order('homepage_order', { ascending: true })
      .limit(10),
  ])
  return { heroSlides: heroSlides || [], services: services || [] }
}

export default async function Page() {
  const [page, graph, faqs] = await Promise.all([
    getPageWithSections('home'),
    getSeoSchemas({ contentType: 'homepage' }),
    getPageFaqs('homepage'),
  ])

  // Falls back to the legacy hardcoded homepage if the page-builder row
  // isn't present yet (e.g. migration not run in this environment).
  if (!page || page.sections.length === 0) {
    const initial = await getHomeFallbackData()
    return (
      <>
        <SchemaScript schemas={graph} />
        <HomeClient initial={initial} />
        <FaqSection faqs={faqs} />
      </>
    )
  }

  return (
    <>
      <SchemaScript schemas={graph} />
      <PageRenderer sections={page.sections} faqsBySection={page.faqsBySection} dataBySection={page.dataBySection} />
      <FaqSection faqs={faqs} />
    </>
  )
}
