'use client'
import SeoEditPanel from '@/components/admin/seo/SeoEditPanel'
export default function CertificationsSeoPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Certifications SEO</h1>
        <p className="text-sm text-gray-400 mt-1">Manage all SEO settings for the Certifications page</p>
      </div>
      <SeoEditPanel contentType="certifications" />
    </div>
  )
}
