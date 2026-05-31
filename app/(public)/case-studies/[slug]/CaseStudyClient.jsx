'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const sectionDefs = [
  { label: 'The Challenge', icon: '🎯', key: 'challenge' },
  { label: 'Strategy',      icon: '🗺️', key: 'strategy'  },
  { label: 'Execution',     icon: '⚡', key: 'execution' },
  { label: 'Results',       icon: '📈', key: 'results'   },
]


export default function CaseStudyClient({ params }) {
  const id = params.slug
  const [cs,      setCs]      = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('case_studies').select('*').eq('id', id).single()
      .then(({ data }) => { setCs(data); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-soft">
      <div className="spinner" />
    </div>
  )

  if (!cs) return (
    <div className="min-h-screen flex items-center justify-center bg-soft">
      <div className="text-center">
        <p className="text-body text-gray-500 mb-4">Case study not found.</p>
        <Link href="/portfolio" className="text-body-sm font-bold" style={{ color: 'var(--accent)' }}>
          &larr; Back to Portfolio
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link href="/portfolio"
              className="text-body-sm font-semibold text-gray-400 hover:text-accent flex items-center gap-1 mb-8 transition-colors">
          &larr; Back to Portfolio
        </Link>

        {cs.cover_image_url && (
          <img src={cs.cover_image_url} alt={cs.title}
               className="w-full h-64 object-cover rounded-2xl mb-10 shadow-card" />
        )}

        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="badge-accent">{cs.industry}</span>
            {cs.is_featured && <span className="badge-warn">Featured</span>}
          </div>
          <h1 className="heading-display text-deep mb-2">{cs.title}</h1>
          <p className="text-body text-gray-500">
            Client: <span className="font-semibold text-deep">{cs.client_name}</span>
          </p>
        </div>

        {cs.key_metrics && Object.keys(cs.key_metrics).length > 0 && (
          <div className="card-elevated p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {Object.entries(cs.key_metrics).map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="text-price-val mb-1" style={{ color: 'var(--accent)' }}>{v}</div>
                <div className="text-body-sm text-gray-500 font-medium">{k}</div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-10">
          {sectionDefs.filter(s => cs[s.key]).map(section => (
            <div key={section.label}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-xl">{section.icon}</span>
                <h2 className="heading-section">{section.label}</h2>
              </div>
              <div className="card p-6">
                <p className="text-body text-gray-600 leading-relaxed whitespace-pre-line">
                  {cs[section.key]}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl p-8 text-center"
             style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
          <h3 className="heading-section mb-2">Want results like this?</h3>
          <p className="text-body text-gray-500 mb-6">Let&rsquo;s build a strategy for your brand.</p>
          <Link href="/contact" className="btn-primary btn-lg">Start a Conversation</Link>
        </div>

      </div>
    </div>
  )
}
