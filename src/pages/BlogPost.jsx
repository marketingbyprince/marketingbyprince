import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function BlogPost() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('articles').select('*').eq('slug', slug).eq('is_published', true).single()
      .then(({ data }) => { setArticle(data); setLoading(false) })
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!article) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Article not found.</p>
        <Link to="/blog" className="text-blue-400 hover:underline">← Back to Blog</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <Link to="/blog" className="text-gray-500 hover:text-white text-sm flex items-center gap-1 mb-8 transition-colors">
          ← Back to Blog
        </Link>

        {article.cover_image_url && (
          <img src={article.cover_image_url} alt={article.title} className="w-full h-72 object-cover rounded-2xl mb-8" />
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          {article.category && (
            <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">{article.category}</span>
          )}
          {article.read_time_minutes && (
            <span className="text-xs text-gray-500">{article.read_time_minutes} min read</span>
          )}
          {article.published_at && (
            <span className="text-xs text-gray-600">
              {new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">{article.title}</h1>

        {article.excerpt && (
          <p className="text-lg text-gray-400 leading-relaxed mb-8 pb-8 border-b border-gray-800">{article.excerpt}</p>
        )}

        {/* Content — rendered as plain text / pre-formatted markdown */}
        <div className="prose-custom text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">
          {article.content}
        </div>

        <div className="mt-14 pt-8 border-t border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-xl">👨‍💼</div>
            <div>
              <p className="text-white font-semibold text-sm">Prince Pandey</p>
              <p className="text-gray-400 text-xs">Performance Marketer & Key Account Manager</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-1">Found this useful?</p>
          <p className="text-gray-400 text-sm mb-4">Let's work together on your marketing strategy.</p>
          <Link to="/contact" className="inline-block px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  )
}
