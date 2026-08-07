'use client'
import Link from 'next/link'

// current: the case study being viewed. others: lightweight rows for every
// other published case study. Matches by channel first, then industry, then
// falls back to the most recent remaining projects so the section never
// renders empty as long as at least one other case study exists.
export default function RelatedProjects({ current, others = [] }) {
  if (!others.length) return null

  const byChannel = others.filter(o => o.channel && o.channel === current.channel)
  const byIndustry = others.filter(o => o.industry && o.industry === current.industry && !byChannel.includes(o))
  const rest = others.filter(o => !byChannel.includes(o) && !byIndustry.includes(o))
  const related = [...byChannel, ...byIndustry, ...rest].slice(0, 3)

  if (!related.length) return null

  return (
    <div>
      <h2 className="heading-section mb-6">More Work</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map(c => (
          <Link key={c.id} href={`/case-studies/${c.slug || c.id}`} className="card-interactive overflow-hidden group block">
            {c.cover_image_url ? (
              <img src={c.cover_image_url} alt={c.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-36 flex items-center justify-center text-3xl" style={{ background: 'var(--accent-muted)' }}>📊</div>
            )}
            <div className="p-5">
              {c.channel && <span className="badge-accent mb-2 inline-block">{c.channel}</span>}
              <h3 className="font-extrabold text-deep text-sm leading-snug mb-1">{c.title}</h3>
              <p className="text-xs text-gray-500">{c.client_name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
