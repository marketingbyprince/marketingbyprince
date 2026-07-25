'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageRenderer from '@/components/sections/PageRenderer'

// Admin-only preview: renders a page (draft or published) exactly as
// PageRenderer would on the public site. Gated by AdminLayout's auth check
// and readable via the authenticated RLS policies on pages/page_sections/faqs.
export default function PreviewPage({ params }) {
  const [state, setState] = useState({ loading: true, page: null, sections: [], faqsBySection: {} })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: page } = await supabase.from('pages').select('*').eq('slug', params.slug).single()
      if (!page) { if (!cancelled) setState({ loading: false, page: null, sections: [], faqsBySection: {} }); return }

      const [{ data: sections }, { data: faqs }] = await Promise.all([
        supabase.from('page_sections').select('*').eq('page_id', page.id).eq('is_visible', true).order('sort_order'),
        supabase.from('faqs').select('*').eq('page_id', page.id).eq('is_active', true).order('sort_order'),
      ])

      const faqSection = (sections || []).find(s => s.section_type === 'faq_accordion')
      const faqsBySection = faqSection && faqs?.length ? { [faqSection.id]: faqs } : {}

      if (!cancelled) setState({ loading: false, page, sections: sections || [], faqsBySection })
    }
    load()
    return () => { cancelled = true }
  }, [params.slug])

  if (state.loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>
  }

  if (!state.page) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-2xl mb-2">📄</p>
          <p className="text-gray-500">No page found for slug "{params.slug}"</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-[60] text-center text-xs font-semibold py-1.5"
           style={{ backgroundColor: state.page.status === 'published' ? '#16A34A' : '#F59E0B', color: '#fff' }}>
        Admin Preview — {state.page.status === 'published' ? 'Published' : 'Draft'} — /{state.page.slug}
      </div>
      <Navbar />
      <PageRenderer sections={state.sections} faqsBySection={state.faqsBySection} />
      <Footer />
    </div>
  )
}
