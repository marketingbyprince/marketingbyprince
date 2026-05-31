'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SeoEditPanel from '@/components/admin/seo/SeoEditPanel'

export default function CaseStudySeoEditPage({ params }) {
  const { id } = params
  const [cs, setCs] = useState(null)

  useEffect(() => {
    supabase.from('case_studies').select('title, client_name, industry').eq('id', id).single().then(({ data }) => setCs(data))
  }, [id])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link href="/admin/seo" className="hover:text-white">SEO Center</Link>
          <span>›</span>
          <Link href="/admin/seo/case-studies" className="hover:text-white">Case Studies</Link>
          <span>›</span>
          <span className="text-white">{cs?.title || 'Loading…'}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">{cs?.title || '…'}</h1>
        {cs?.client_name && <p className="text-sm text-gray-400 mt-1">{cs.client_name} · {cs.industry}</p>}
      </div>
      <SeoEditPanel contentType="case_study" contentId={id} />
    </div>
  )
}
