'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SectionHeader from '@/components/ui/SectionHeader'

// Portfolio is a curated, visual-first highlight reel (featured case studies
// only) that funnels into the full narrative on /case-studies/[id]. The
// complete, filterable index of every case study lives on /case-studies —
// this page intentionally shows a smaller, hand-picked set.
export default function PortfolioClient() {
  const [cases,   setCases]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: featured } = await supabase.from('case_studies').select('*')
        .eq('is_published', true).eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (cancelled) return

      // Fall back to the full published set until the admin curates featured work.
      if (featured?.length) {
        setCases(featured)
        setLoading(false)
        return
      }

      const { data: all } = await supabase.from('case_studies').select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      if (!cancelled) { setCases(all || []); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-wrap">

        <SectionHeader
          eyebrow="Portfolio"
          title="Selected Work"
          subtitle="A visual look at recent campaigns — click through for the full breakdown of strategy, execution, and results."
        />

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : cases.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📁</p>
            <p className="text-body">Portfolio pieces coming soon. Check back later.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map(c => (
              <Link
                key={c.id}
                href={`/case-studies/${c.id}`}
                className="card-interactive overflow-hidden group block relative"
              >
                {c.cover_image_url ? (
                  <img src={c.cover_image_url} alt={c.title}
                       className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-52 flex items-center justify-center text-4xl"
                       style={{ background: 'var(--accent-muted)' }}>
                    📊
                  </div>
                )}
                {c.portfolio_url && (
                  <a
                    href={c.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full bg-white/95 text-deep hover:bg-white transition-colors shadow-sm"
                  >
                    View Live ↗
                  </a>
                )}
                <div className="p-6">
                  <span className="badge-accent mb-3 inline-block">{c.industry}</span>
                  <h3 className="heading-section mb-1.5">{c.title}</h3>
                  <p className="text-body-sm text-gray-500 mb-4">{c.client_name}</p>
                  {c.key_metrics && Object.keys(c.key_metrics).length > 0 && (
                    <div className="flex gap-4">
                      {Object.entries(c.key_metrics).slice(0, 2).map(([k, v]) => (
                        <div key={k}>
                          <div className="font-black text-lg" style={{ color: 'var(--accent)' }}>{v}</div>
                          <div className="text-xs text-gray-500">{k}</div>
                        </div>
                      ))}
                    </div>
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
