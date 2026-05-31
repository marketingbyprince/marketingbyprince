'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'


export default function BlogPostClient({ params }) {
  const slug = params.slug
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('articles').select('*').eq('slug', slug).eq('is_published', true).single()
      .then(({ data }) => { setArticle(data); setLoading(false) })
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-soft">
      <div className="spinner" />
    </div>
  )

  if (!article) return (
    <div className="min-h-screen flex items-center justify-center bg-soft">
      <div className="text-center">
        <p className="text-body text-gray-500 mb-4">Article not found.</p>
        <Link href="/blog" className="text-body-sm font-bold" style={{ color: 'var(--accent)' }}>
          &larr; Back to Blog
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-tight">

        <Link href="/blog"
              className="text-body-sm font-semibold text-gray-400 hover:text-accent flex items-center gap-1 mb-8 transition-colors">
          &larr; Back to Blog
        </Link>

        {article.cover_image_url && (
          <img src={article.cover_image_url} alt={article.title}
               className="w-full h-72 object-cover rounded-2xl mb-8 shadow-card" />
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          {article.category && (
            <span className="badge-accent">{article.category}</span>
          )}
          {article.read_time_minutes && (
            <span className="text-xs text-gray-400 font-medium">{article.read_time_minutes} min read</span>
          )}
          {article.published_at && (
            <span className="text-xs text-gray-400 font-medium">
              {new Date(article.published_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          )}
        </div>

        <h1 className="heading-display text-deep mb-6 leading-tight">{article.title}</h1>

        {article.excerpt && (
          <p className="text-body text-gray-500 leading-relaxed mb-8 pb-8 border-b border-gray-200">
            {article.excerpt}
          </p>
        )}

        <div className="text-body text-gray-600 leading-relaxed whitespace-pre-line">
          {article.content}
        </div>

        <div className="mt-14 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                 style={{ backgroundColor: 'var(--accent-muted)' }}>
              👨‍💼
            </div>
            <div>
              <p className="text-deep font-bold text-sm">Prince Pandey</p>
              <p className="text-body-sm text-gray-500">Performance Marketer &amp; Key Account Manager</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl p-6 text-center"
             style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
          <p className="heading-section mb-1">Found this useful?</p>
          <p className="text-body text-gray-500 mb-5">
            Let&rsquo;s work together on your marketing strategy.
          </p>
          <Link href="/contact" className="btn-primary btn-md">Get in Touch</Link>
        </div>

      </div>
    </div>
  )
}
