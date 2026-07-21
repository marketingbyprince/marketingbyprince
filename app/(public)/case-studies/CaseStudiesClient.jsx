'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function CaseStudiesClient() {
  const [cases,    setCases]    = useState([])
  const [industry, setIndustry] = useState('All')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase.from('case_studies').select('*').eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCases(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const industries = ['All', ...new Set(cases.map(c => c.industry).filter(Boolean))]
  const filtered   = industry === 'All' ? cases : cases.filter(c => c.industry === industry)

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Raleway', sans-serif", paddingTop: '80px' }}>

      {/* Header */}
      <section style={{ backgroundColor: '#111827', padding: 'clamp(48px, 6vw, 80px) 0' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">
          <span className="inline-block mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#FF6933' }}>
            Case Studies
          </span>
          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 38px)',
              fontWeight: 800,
              color: '#F9FAFB',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}
          >
            Real Results, Not Just Reports
          </h1>
          <p style={{ fontSize: '14.5px', color: '#9CA3AF', maxWidth: '560px', lineHeight: 1.7 }}>
            Deep dives into campaigns I've run — what the brief was, what I built, and what the numbers looked like.
          </p>
        </div>
      </section>

      {/* Filters + Grid */}
      <section style={{ backgroundColor: '#F9FAFB', padding: 'clamp(40px, 6vw, 80px) 0' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">

          {/* Industry filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {industries.map(ind => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={industry === ind ? 'filter-pill-on' : 'filter-pill-off'}
              >
                {ind}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📁</p>
              <p style={{ color: '#6B7280', fontSize: '14px' }}>
                Case studies coming soon.{' '}
                <Link href="/contact" style={{ color: '#FF6933', fontWeight: 600 }}>Get in touch</Link>{' '}
                to discuss your project.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(c => (
                <Link
                  key={c.id}
                  href={`/case-studies/${c.id}`}
                  className="group block bg-white rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
                  style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                >
                  {c.cover_image_url ? (
                    <img
                      src={c.cover_image_url}
                      alt={c.title}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{ height: '176px' }}
                    />
                  ) : (
                    <div
                      className="w-full flex items-center justify-center text-4xl"
                      style={{ height: '176px', backgroundColor: '#FFF3EE' }}
                    >
                      📊
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      {c.industry && (
                        <span className="badge-accent">{c.industry}</span>
                      )}
                      {c.is_featured && (
                        <span className="badge-warn">Featured</span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '6px', lineHeight: 1.3 }}>
                      {c.title}
                    </h3>
                    {c.client_name && (
                      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>{c.client_name}</p>
                    )}

                    {c.key_metrics && Object.keys(c.key_metrics).length > 0 && (
                      <div className="flex gap-6 mb-4">
                        {Object.entries(c.key_metrics).slice(0, 2).map(([k, v]) => (
                          <div key={k}>
                            <div style={{ fontSize: '20px', fontWeight: 900, color: '#FF6933', lineHeight: 1.2 }}>{v}</div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{k}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <span
                      className="inline-flex items-center gap-1 group-hover:gap-2 transition-all font-semibold"
                      style={{ color: '#FF6933', fontSize: '13px' }}
                    >
                      Read case study <span>&rarr;</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
