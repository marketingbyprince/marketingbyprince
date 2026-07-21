'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function AuthorCard({ author }) {
  if (!author) return null
  const authorHref = author.slug ? `/author/${author.slug}` : '/author'
  return (
    <div className="mt-14 pt-8 border-t border-gray-200">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Written by</p>
      <div className="flex items-start gap-4">
        <Link href={authorHref} className="shrink-0">
          {author.avatar_url ? (
            <img src={author.avatar_url} alt={author.name}
                 className="w-14 h-14 rounded-full object-cover hover:ring-2 transition-all"
                 style={{ '--tw-ring-color': 'var(--accent)' }} />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--accent-muted)' }}>
              👨‍💼
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={authorHref} className="hover:underline">
            <p className="text-deep font-bold text-sm">{author.name}</p>
          </Link>
          <p className="text-body-sm text-gray-500 mb-2">{author.title}</p>
          {author.bio && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">{author.bio}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {author.linkedin_url && (
              <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer"
                 className="text-xs font-semibold hover:underline transition-colors"
                 style={{ color: 'var(--accent)' }}>
                LinkedIn ↗
              </a>
            )}
            {author.twitter_url && (
              <a href={author.twitter_url} target="_blank" rel="noopener noreferrer"
                 className="text-xs font-semibold hover:underline transition-colors"
                 style={{ color: 'var(--accent)' }}>
                Twitter / X ↗
              </a>
            )}
            <Link href={authorHref}
                  className="text-xs font-semibold hover:underline transition-colors text-gray-400">
              View all articles →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function BlogPostClient({ params }) {
  const slug = params.slug
  const [article, setArticle] = useState(null)
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('articles').select('*').eq('slug', slug).eq('is_published', true).single(),
      supabase.from('author_profile').select('*').eq('id', 1).single(),
    ]).then(([{ data: art }, { data: auth }]) => {
      setArticle(art)
      setAuthor(auth)
      setLoading(false)
    }).catch(() => setLoading(false))
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

        <div
          className="prose-rte"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />

        <AuthorCard author={author} />

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
