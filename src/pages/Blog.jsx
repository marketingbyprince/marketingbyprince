import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Blog() {
  const [articles, setArticles] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('articles').select('id, title, slug, excerpt, cover_image_url, category, read_time_minutes, published_at')
      .eq('is_published', true).order('published_at', { ascending: false })
      .then(({ data }) => { setArticles(data || []); setLoading(false) })
  }, [])

  const categories = ['All', ...new Set(articles.map(a => a.category).filter(Boolean))]
  const filtered = activeCategory === 'All' ? articles : articles.filter(a => a.category === activeCategory)

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Blog</span>
          <h1 className="text-4xl font-bold text-white mt-2 mb-3">Insights & Learnings</h1>
          <p className="text-gray-400">Marketing strategies, campaign breakdowns, and industry thoughts.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#111827] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">✍️</p>
            <p>Articles coming soon. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(article => (
              <Link
                key={article.id}
                to={`/blog/${article.slug}`}
                className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all group block"
              >
                {article.cover_image_url ? (
                  <img src={article.cover_image_url} alt={article.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-4xl">
                    ✍️
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {article.category && (
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full font-medium">{article.category}</span>
                    )}
                    {article.read_time_minutes && (
                      <span className="text-xs text-gray-500">{article.read_time_minutes} min read</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold mb-2 leading-snug group-hover:text-blue-300 transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
                  )}
                  {article.published_at && (
                    <p className="text-gray-600 text-xs mt-4">
                      {new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
