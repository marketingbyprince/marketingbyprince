'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SeoEditPanel from '@/components/admin/seo/SeoEditPanel'

export default function GigSeoEditPage({ params }) {
  const { id } = params
  const [gig, setGig] = useState(null)

  useEffect(() => {
    supabase.from('gigs').select('title, category').eq('id', id).single().then(({ data }) => setGig(data))
  }, [id])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link href="/admin/seo" className="hover:text-white">SEO Center</Link>
          <span>›</span>
          <Link href="/admin/seo/gigs" className="hover:text-white">Gigs</Link>
          <span>›</span>
          <span className="text-white">{gig?.title || 'Loading…'}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">{gig?.title || '…'}</h1>
        {gig?.category && <p className="text-sm text-gray-400 mt-1">{gig.category}</p>}
      </div>
      <SeoEditPanel contentType="gig" contentId={id} />
    </div>
  )
}
