'use client'
import Link from 'next/link'
import SeoEditPanel from '@/components/admin/seo/SeoEditPanel'

export default function PageSeoEdit() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link href="/admin/seo" className="hover:text-white">SEO Center</Link>
          <span>›</span>
          <Link href="/admin/seo/gigs" className="hover:text-white">Gigs</Link>
          <span>›</span>
          <span className="text-white">Listing Page SEO</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Gigs Listing Page</h1>
        <p className="text-sm text-gray-400 mt-1">SEO settings for the main /gigs listing page</p>
      </div>
      <SeoEditPanel contentType="gigs" />
    </div>
  )
}
