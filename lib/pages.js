import { supabase } from '@/lib/supabase'

// Some section types render live data from other tables rather than pure
// JSON content (e.g. featured case studies, active testimonials). This maps
// section_type -> a fetcher, keyed back onto the section's id so
// PageRenderer can hand each section exactly the data it needs.
export async function resolveSectionData(sections) {
  const dataBySection = {}
  const tasks = []

  const caseStudySection = sections.find(s => s.section_type === 'case_study_slider')
  if (caseStudySection) {
    tasks.push((async () => {
      const { data: featured } = await supabase.from('case_studies').select('*')
        .eq('is_published', true).eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (featured?.length) {
        dataBySection[caseStudySection.id] = { caseStudies: featured }
        return
      }
      const { data: all } = await supabase.from('case_studies').select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6)
      dataBySection[caseStudySection.id] = { caseStudies: all || [] }
    })())
  }

  const testimonialsSection = sections.find(s => s.section_type === 'testimonials_slider')
  if (testimonialsSection) {
    tasks.push(
      supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order', { ascending: true })
        .then(({ data }) => { dataBySection[testimonialsSection.id] = { testimonials: data || [] } })
    )
  }

  const insightsSection = sections.find(s => s.section_type === 'insights_slider')
  if (insightsSection) {
    tasks.push(
      supabase.from('articles').select('*').eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3)
        .then(({ data }) => { dataBySection[insightsSection.id] = { articles: data || [] } })
    )
  }

  const trustSection = sections.find(s => s.section_type === 'stats_trust')
  if (trustSection) {
    tasks.push(
      supabase.from('trust_logos').select('*').eq('is_active', true).order('sort_order', { ascending: true })
        .then(({ data }) => { dataBySection[trustSection.id] = { trustLogos: data || [] } })
    )
  }

  await Promise.all(tasks)
  return dataBySection
}

// Fetches a published page and its visible sections, ordered for rendering.
// Used by page-builder-driven routes (see components/sections/PageRenderer).
export async function getPageWithSections(slug) {
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (pageError || !page) return null

  const { data: sections } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_id', page.id)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .eq('page_id', page.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const faqSection = (sections || []).find(s => s.section_type === 'faq_accordion')
  const faqsBySection = faqSection && faqs?.length ? { [faqSection.id]: faqs } : {}

  const dataBySection = await resolveSectionData(sections || [])

  return { ...page, sections: sections || [], faqsBySection, dataBySection }
}

// Metadata for simple, mostly-static page-builder pages (legal pages, etc).
// Falls back to a noindex placeholder title if the page isn't published yet.
export async function getStaticPageMetadata(slug, fallbackTitle) {
  const page = await getPageWithSections(slug)
  if (!page) {
    return { title: fallbackTitle, robots: { index: false, follow: false } }
  }
  return {
    title: `${page.title} | Marketing By Prince`,
    alternates: { canonical: `https://marketingbyprince.com/${slug}` },
  }
}
