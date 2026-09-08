'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const LIGHT_FIELDS = 'id, slug, title, client_name, industry, channel, summary, cover_image_url, key_metrics, is_featured, sort_order, created_at'

function ChevronIcon({ open }) {
  return (
    <svg
      width="10" height="6" viewBox="0 0 10 6" fill="none"
      className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isActive = value !== 'All'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-2 pl-4 pr-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
          isActive
            ? 'text-accent border-accent/30'
            : 'bg-white border-gray-200 text-charcoal hover:border-accent/40'
        }`}
        style={isActive ? { backgroundColor: 'var(--accent-muted)' } : undefined}
      >
        <span className="text-gray-400 font-medium">{label}</span>
        <span className="max-w-[170px] truncate">{value}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-2 min-w-[240px] max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl py-1.5 z-20"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          {options.map(opt => {
            const selected = opt === value
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`flex items-center justify-between gap-3 w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                  selected ? 'font-semibold text-accent' : 'text-charcoal hover:bg-gray-50'
                }`}
                style={selected ? { backgroundColor: 'var(--accent-muted)' } : undefined}
              >
                <span className="truncate">{opt}</span>
                {selected && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                    <path d="M2.5 7.2L5.6 10.3L11.5 3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function CaseStudiesClient() {
  const [cases,    setCases]    = useState([])
  const [industry, setIndustry] = useState('All')
  const [channel,  setChannel]  = useState('All')
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase.from('case_studies').select(LIGHT_FIELDS).eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCases(data || []); setLoading(false) })
  }, [])

  const industries = useMemo(() => ['All', ...new Set(cases.map(c => c.industry).filter(Boolean))], [cases])
  const channels   = useMemo(() => ['All', ...new Set(cases.map(c => c.channel).filter(Boolean))], [cases])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return cases.filter(c =>
      (industry === 'All' || c.industry === industry) &&
      (channel === 'All' || c.channel === channel) &&
      (!q ||
        c.title?.toLowerCase().includes(q) ||
        c.client_name?.toLowerCase().includes(q) ||
        c.summary?.toLowerCase().includes(q))
    )
  }, [cases, industry, channel, search])

  const hasActiveFilters = industry !== 'All' || channel !== 'All' || search.trim() !== ''

  function clearFilters() {
    setIndustry('All')
    setChannel('All')
    setSearch('')
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Raleway', sans-serif", paddingTop: '80px' }}>

      {/* Header */}
      <section style={{ backgroundColor: '#111827', padding: 'clamp(48px, 6vw, 80px) 0' }}>
        <div className="section-wrap">
          <span className="eyebrow mb-4 inline-block">Case Studies</span>
          <h1 className="heading-display text-white mb-4" style={{ fontSize: 'clamp(28px, 4vw, 38px)' }}>
            Real Results, Not Just Reports
          </h1>
          <p style={{ fontSize: '14.5px', color: '#9CA3AF', maxWidth: '560px', lineHeight: 1.7 }}>
            Deep dives into the campaigns I&rsquo;ve run &mdash; the brief, what I built, and the numbers behind it.
          </p>
        </div>
      </section>

      {/* Filters + Grid */}
      <section style={{ backgroundColor: '#F9FAFB', padding: 'clamp(40px, 6vw, 72px) 0' }}>
        <div className="section-wrap">

          {/* Filter bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              {channels.length > 2 && (
                <FilterDropdown label="Channel" value={channel} options={channels} onChange={setChannel} />
              )}
              {industries.length > 2 && (
                <FilterDropdown label="Industry" value={industry} options={industries} onChange={setIndustry} />
              )}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-accent transition-colors cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="relative w-full lg:w-72">
              <svg
                width="15" height="15" viewBox="0 0 15 15" fill="none"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              >
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search case studies"
                className="input-field pl-9 py-2.5 text-sm"
              />
            </div>
          </div>

          {!loading && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-6">
              {filtered.length} {filtered.length === 1 ? 'case study' : 'case studies'}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              {hasActiveFilters ? (
                <>
                  <p style={{ color: '#6B7280', fontSize: '14px' }} className="mb-4">
                    No case studies match your filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-bold cursor-pointer"
                    style={{ color: '#FF6933' }}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <p style={{ color: '#6B7280', fontSize: '14px' }}>
                  Case studies coming soon.{' '}
                  <Link href="/contact" style={{ color: '#FF6933', fontWeight: 600 }}>Get in touch</Link>{' '}
                  to discuss your project.
                </p>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(c => (
                <Link
                  key={c.id}
                  href={`/case-studies/${c.slug || c.id}`}
                  className="card-interactive group block overflow-hidden"
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
                      style={{ height: '176px', backgroundColor: 'var(--accent-muted)' }}
                    >
                      📊
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {c.channel && <span className="badge-accent">{c.channel}</span>}
                      {c.industry && <span className="badge-gray">{c.industry}</span>}
                      {c.is_featured && <span className="badge-warn">Featured</span>}
                    </div>

                    <h3 className="font-extrabold text-deep text-base leading-snug mb-1.5">
                      {c.title}
                    </h3>
                    {c.client_name && (
                      <p className="text-xs text-gray-500 mb-3">{c.client_name}</p>
                    )}
                    {c.summary && (
                      <p className="text-body-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                        {c.summary}
                      </p>
                    )}

                    {c.key_metrics && Object.keys(c.key_metrics).length > 0 && (
                      <div className="flex gap-6 mb-4 pt-4 border-t border-gray-100 flex-wrap">
                        {Object.entries(c.key_metrics).slice(0, 2).map(([k, v]) => (
                          <div key={k}>
                            <div className="font-black text-xl leading-tight" style={{ color: '#FF6933' }}>{v}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{k}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <span
                      className="inline-flex items-center gap-1 group-hover:gap-2 transition-all font-semibold"
                      style={{ color: '#FF6933', fontSize: '13px' }}
                    >
                      Read case study &rarr;
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
