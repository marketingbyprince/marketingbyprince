'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SeoEditPanel from '@/components/admin/seo/SeoEditPanel'

export default function ServiceSeoEditPage({ params }) {
  const { id } = params
  const [service, setService] = useState(null)

  useEffect(() => {
    supabase.from('services').select('title, pillar').eq('id', id).single().then(({ data }) => setService(data))
  }, [id])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link href="/admin/seo" className="hover:text-white">SEO Center</Link>
          <span>›</span>
          <Link href="/admin/seo/services" className="hover:text-white">Services</Link>
          <span>›</span>
          <span className="text-white">{service?.title || 'Loading…'}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">{service?.title || '…'}</h1>
        {service?.pillar && <p className="text-sm text-gray-400 mt-1">{service.pillar}</p>}
      </div>
      <SeoEditPanel contentType="service" contentId={id} />
    </div>
  )
}
