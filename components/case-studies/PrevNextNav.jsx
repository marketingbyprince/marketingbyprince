'use client'
import Link from 'next/link'

// ordered: every published case study (lightweight rows) in display order,
// including the current one. Wraps around at either end so it's always
// navigable regardless of where the current project sits in the list.
export default function PrevNextNav({ currentId, ordered = [] }) {
  if (ordered.length < 2) return null
  const idx = ordered.findIndex(c => c.id === currentId)
  if (idx === -1) return null

  const prev = ordered[(idx - 1 + ordered.length) % ordered.length]
  const next = ordered[(idx + 1) % ordered.length]

  return (
    <div className="flex items-stretch gap-4 flex-col sm:flex-row">
      <Link
        href={`/case-studies/${prev.slug || prev.id}`}
        className="card-interactive flex-1 p-5 flex flex-col gap-1"
      >
        <span className="text-body-sm font-bold" style={{ color: 'var(--accent)' }}>&larr; Previous Project</span>
        <span className="font-extrabold text-deep text-sm truncate">{prev.title}</span>
      </Link>
      <Link
        href={`/case-studies/${next.slug || next.id}`}
        className="card-interactive flex-1 p-5 flex flex-col gap-1 text-right"
      >
        <span className="text-body-sm font-bold" style={{ color: 'var(--accent)' }}>Next Project &rarr;</span>
        <span className="font-extrabold text-deep text-sm truncate">{next.title}</span>
      </Link>
    </div>
  )
}
