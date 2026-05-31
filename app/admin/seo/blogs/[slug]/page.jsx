'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SeoEditPanel from '@/components/admin/seo/SeoEditPanel'

export default function BlogSeoEditPage({ params }) {
  const { slug } = params
  const [article, setArticle] = useState(null)

  useEffect(() => {
    supabase.from('articles').select('title, category').eq('slug', slug).single().then(({ data }) => setArticle(data))
  }, [slug])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link href="/admin/seo" className="hover:text-white">SEO Center</Link>
          <span>›</span>
          <Link href="/admin/seo/blogs" className="hover:text-white">Blogs</Link>
          <span>›</span>
          <span className="text-white">{article?.title || slug}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">{article?.title || slug}</h1>
        {article?.category && <p className="text-sm text-gray-400 mt-1">{article.category}</p>}
      </div>
      <SeoEditPanel contentType="blog_post" contentId={slug} />
    </div>
  )
}
