import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Authors | Marketing By Prince',
  description: 'Meet the authors behind Marketing By Prince.',
}

export default async function AuthorsPage() {
  const { data: authors } = await supabase
    .from('author_profile')
    .select('*')
    .order('id')

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-tight">

        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
            Meet the Team
          </p>
          <h1 className="heading-display text-deep mb-4">Authors</h1>
          <p className="text-body text-gray-500 max-w-lg mx-auto">
            The people behind the content on Marketing By Prince.
          </p>
        </div>

        {!authors || authors.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No authors yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {authors.map(a => (
              <Link key={a.id} href={`/author/${a.slug}`}
                    className="group bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-5">
                {a.avatar_url ? (
                  <img src={a.avatar_url} alt={a.name}
                       className="w-16 h-16 rounded-full object-cover shrink-0 border-2"
                       style={{ borderColor: 'var(--accent-border)' }} />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shrink-0"
                       style={{ backgroundColor: 'var(--accent-muted)', border: '2px solid var(--accent-border)' }}>
                    👨‍💼
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-deep font-bold text-base group-hover:text-accent transition-colors">
                    {a.name}
                  </p>
                  {a.title && (
                    <p className="text-gray-500 text-sm mt-0.5">{a.title}</p>
                  )}
                  {a.bio && (
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">{a.bio}</p>
                  )}
                  <p className="text-xs font-semibold mt-2 transition-colors"
                     style={{ color: 'var(--accent)' }}>
                    View profile →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
