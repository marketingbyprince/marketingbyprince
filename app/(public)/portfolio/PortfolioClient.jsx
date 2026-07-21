'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SectionHeader from '@/components/ui/SectionHeader'


export default function PortfolioClient() {
  const [cases,          setCases]          = useState([])
  const [activeIndustry, setActiveIndustry] = useState('All')
  const [loading,        setLoading]        = useState(true)

  useEffect(() => {
    supabase.from('case_studies').select('*').eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCases(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const industries = ['All', ...new Set(cases.map(c => c.industry).filter(Boolean))]
  const filtered   = activeIndustry === 'All' ? cases : cases.filter(c => c.industry === activeIndustry)

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-wrap">

        <SectionHeader
          eyebrow="Portfolio"
          title="Case Studies"
          subtitle="Real campaigns. Real results. Here's how I've helped brands grow."
        />

        <div className="flex flex-wrap gap-2 mb-10">
          {industries.map(ind => (
            <button
              key={ind}
              onClick={() => setActiveIndustry(ind)}
              className={activeIndustry === ind ? 'filter-pill-on' : 'filter-pill-off'}
            >
              {ind}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📁</p>
            <p className="text-body">Case studies coming soon. Check back later.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <Link
                key={c.id}
                href={`/case-studies/${c.id}`}
                className="card-interactive overflow-hidden group block"
              >
                {c.cover_image_url ? (
                  <img src={c.cover_image_url} alt={c.title}
                       className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-44 flex items-center justify-center text-4xl"
                       style={{ background: 'var(--accent-muted)' }}>
                    📊
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge-accent">{c.industry}</span>
                    {c.is_featured && <span className="badge-warn">Featured</span>}
                  </div>
                  <h3 className="heading-section mb-1.5">{c.title}</h3>
                  <p className="text-body-sm text-gray-500 mb-4">{c.client_name}</p>
                  {c.key_metrics && (
                    <div className="flex gap-4">
                      {Object.entries(c.key_metrics).slice(0, 2).map(([k, v]) => (
                        <div key={k}>
                          <div className="font-black text-lg" style={{ color: 'var(--accent)' }}>{v}</div>
                          <div className="text-xs text-gray-500">{k}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="text-body-sm font-bold mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                        style={{ color: 'var(--accent)' }}>
                    Read case study <span>&rarr;</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
