import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { data } = await supabase.from('author_profile').select('name, title').eq('slug', params.slug).single()
  if (!data) return {}
  return {
    title: `${data.name} — Author | Marketing By Prince`,
    description: data.title,
  }
}

async function getAuthor(slug) {
  const { data } = await supabase.from('author_profile').select('*').eq('slug', slug).single()
  return data
}

async function getRecentArticles(authorName) {
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, category, excerpt, cover_image_url, published_at, read_time_minutes')
    .eq('is_published', true)
    .eq('author', authorName)
    .order('published_at', { ascending: false })
    .limit(6)
  return data || []
}

export default async function AuthorSlugPage({ params }) {
  const author = await getAuthor(params.slug)
  if (!author) notFound()

  const articles = await getRecentArticles(author.name)

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-tight">

        <Link href="/blog"
              className="text-body-sm font-semibold text-gray-400 hover:text-accent flex items-center gap-1 mb-10 transition-colors">
          &larr; Back to Blog
        </Link>

        {/* Author Hero */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-14">
          <div className="shrink-0">
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.name}
                className="w-28 h-28 rounded-full object-cover shadow-card border-4"
                style={{ borderColor: 'var(--accent-border)' }}
              />
            ) : (
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-4xl shadow-card"
                style={{ backgroundColor: 'var(--accent-muted)', border: '4px solid var(--accent-border)' }}
              >
                👨‍💼
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
              Author
            </p>
            <h1 className="heading-display text-deep mb-2">{author.name}</h1>
            {author.title && (
              <p className="text-body text-gray-500 mb-4">{author.title}</p>
            )}
            {author.bio && (
              <p className="text-body text-gray-500 leading-relaxed max-w-xl mb-6">{author.bio}</p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
              {author.linkedin_url && (
                <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                   style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              )}
              {author.twitter_url && (
                <a href={author.twitter_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                   style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                  </svg>
                  Twitter / X
                </a>
              )}
              {author.website_url && (
                <a href={author.website_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border"
                   style={{ borderColor: 'var(--accent-border)', color: 'var(--accent)' }}>
                  🌐 Website
                </a>
              )}
              <Link href="/contact" className="btn-primary btn-sm">Work With Me</Link>
            </div>
          </div>
        </div>

        {/* Articles */}
        {articles.length > 0 ? (
          <>
            <h2 className="heading-section text-deep mb-6">Articles by {author.name}</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {articles.map(a => (
                <Link key={a.id} href={`/blog/${a.slug}`}
                      className="group bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  {a.cover_image_url && (
                    <img src={a.cover_image_url} alt={a.title}
                         className="w-full h-44 object-cover" />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {a.category && <span className="badge-accent">{a.category}</span>}
                      {a.read_time_minutes && (
                        <span className="text-xs text-gray-400">{a.read_time_minutes} min read</span>
                      )}
                    </div>
                    <h3 className="text-deep font-bold text-base mb-2 group-hover:text-accent transition-colors line-clamp-2">
                      {a.title}
                    </h3>
                    {a.excerpt && (
                      <p className="text-gray-500 text-sm line-clamp-2">{a.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/blog" className="btn-outline btn-md">View All Articles</Link>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">No articles yet.</div>
        )}

      </div>
    </div>
  )
}
