'use client'
import SeoEditPanel from '@/components/admin/seo/SeoEditPanel'
export default function CaseStudiesSeoPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Case Studies SEO</h1>
        <p className="text-sm text-gray-400 mt-1">Manage all SEO settings for the Case Studies page</p>
      </div>
      <SeoEditPanel contentType="case_studies" />
    </div>
  )
}
