import { supabase } from '@/lib/supabase'

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

  return { ...page, sections: sections || [], faqsBySection }
}
