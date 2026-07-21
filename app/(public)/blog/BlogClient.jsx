'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SectionHeader from '@/components/ui/SectionHeader'


export default function BlogClient() {
  const [articles,        setArticles]        = useState([])
  const [activeCategory,  setActiveCategory]  = useState('All')
  const [loading,         setLoading]         = useState(true)

  useEffect(() => {
    supabase.from('articles')
      .select('id, title, slug, excerpt, cover_image_url, category, read_time_minutes, published_at')
      .eq('is_published', true).order('published_at', { ascending: false })
      .then(({ data }) => { setArticles(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const categories = ['All', ...new Set(articles.map(a => a.category).filter(Boolean))]
  const filtered   = activeCategory === 'All' ? articles : articles.filter(a => a.category === activeCategory)

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-wrap">

        <SectionHeader
          eyebrow="Blog"
          title="Insights & Learnings"
          subtitle="Marketing strategies, campaign breakdowns, and industry thoughts."
        />

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? 'filter-pill-on' : 'filter-pill-off'}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">✍️</p>
            <p className="text-body">Articles coming soon. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(article => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="card-interactive overflow-hidden group block"
              >
                {article.cover_image_url ? (
                  <img src={article.cover_image_url} alt={article.title}
                       className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-44 flex items-center justify-center text-4xl"
                       style={{ background: 'var(--accent-muted)' }}>
                    ✍️
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {article.category && (
                      <span className="badge-accent">{article.category}</span>
                    )}
                    {article.read_time_minutes && (
                      <span className="text-xs text-gray-400 font-medium">
                        {article.read_time_minutes} min read
                      </span>
                    )}
                  </div>
                  <h3 className="heading-section mb-2 leading-snug group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-body-sm text-gray-500 leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  {article.published_at && (
                    <p className="text-xs text-gray-400 mt-4 font-medium">
                      {new Date(article.published_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
