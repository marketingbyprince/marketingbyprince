'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SectionHeader from '@/components/ui/SectionHeader'
import ServiceCard   from '@/components/ServiceCard'


export default function ServicesClient({ initialServices }) {
  const searchParams = useSearchParams()
  const services      = initialServices ?? []
  const [activePillar, setActivePillar] = useState(() => searchParams.get('pillar') || 'All')
  const [search,       setSearch]       = useState('')

  const pillars = useMemo(() => {
    const seen = new Map()
    services.forEach(s => {
      if (s.pillar && !seen.has(s.pillar)) seen.set(s.pillar, s.icon || '📌')
    })
    return [...seen.entries()].map(([label, icon]) => ({ label, icon }))
  }, [services])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return services.filter(s => {
      const matchPillar = activePillar === 'All' || s.pillar === activePillar
      const matchSearch = !q
        || s.title.toLowerCase().includes(q)
        || s.description?.toLowerCase().includes(q)
        || s.pillar?.toLowerCase().includes(q)
      return matchPillar && matchSearch
    })
  }, [services, activePillar, search])

  const grouped = useMemo(() =>
    filtered.reduce((acc, s) => {
      const key = s.pillar || 'General'
      acc[key] = acc[key] ? [...acc[key], s] : [s]
      return acc
    }, {}),
  [filtered])

  const hasResults   = Object.keys(grouped).length > 0
  const isFiltered   = activePillar !== 'All' || search.trim() !== ''
  const handleReset  = () => { setSearch(''); setActivePillar('All') }

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-wrap">

        <SectionHeader
          eyebrow="Services"
          title="Performance Marketing, Backed by a Full Growth Stack"
          subtitle="Performance marketing drives the results — SEO & AEO, marketplace growth, development, and automation make sure they compound."
        />

        {pillars.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActivePillar('All')}
              className={activePillar === 'All' ? 'filter-pill-on' : 'filter-pill-off'}
            >
              All Services
            </button>
            {pillars.map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => setActivePillar(activePillar === label ? 'All' : label)}
                className={activePillar === label ? 'filter-pill-on' : 'filter-pill-off'}
              >
                <span className="mr-1.5">{icon}</span>{label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="relative mb-10">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services…"
            className="input-field pl-11 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {!hasResults ? (
          <EmptyState hasSearch={!!search.trim()} onClear={handleReset} isFiltered={isFiltered} />
        ) : (
          <div className="space-y-14">
            {Object.entries(grouped).map(([pillar, items]) => {
              const pillarIcon = pillars.find(p => p.label === pillar)?.icon ?? '📌'
              return (
                <section key={pillar}>
                  <div className="flex items-center gap-2.5 mb-6">
                    <span className="text-xl leading-none">{pillarIcon}</span>
                    <h2 className="heading-section text-deep">{pillar}</h2>
                    <span
                      className="ml-auto text-xs font-semibold"
                      style={{ color: 'var(--color-subtle)' }}
                    >
                      {items.length} service{items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map(s => <ServiceCard key={s.id} service={s} />)}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        <div
          className="mt-20 rounded-2xl p-10 text-center"
          style={{
            backgroundColor: 'var(--accent-muted)',
            border: '1px solid var(--accent-border)',
          }}
        >
          <h3 className="heading-section mb-2">Don&rsquo;t see what you need?</h3>
          <p className="text-body text-gray-500 mb-6 max-w-md mx-auto">
            Let&rsquo;s discuss a custom solution tailored to your exact goals and budget.
          </p>
          <Link href="/contact" className="btn-primary btn-lg">Talk to Me</Link>
        </div>

      </div>
    </div>
  )
}

function EmptyState({ hasSearch, onClear, isFiltered }) {
  if (hasSearch) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="heading-section mb-2 text-gray-500">No results found</h3>
        <p className="text-body text-gray-400 mb-6 max-w-sm mx-auto">
          Try a different keyword, or clear the search to browse all services.
        </p>
        <button onClick={onClear} className="btn-secondary btn-md">Clear Search</button>
      </div>
    )
  }
  if (isFiltered) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">📂</div>
        <h3 className="heading-section mb-2 text-gray-500">No services in this category</h3>
        <p className="text-body text-gray-400 mb-6">Select a different category or view all services.</p>
        <button onClick={onClear} className="btn-secondary btn-md">View All</button>
      </div>
    )
  }
  return (
    <div className="text-center py-20">
      <div className="text-4xl mb-4">📭</div>
      <h3 className="heading-section mb-2 text-gray-500">No services yet</h3>
      <p className="text-body text-gray-400 mb-6">Services will appear here once they&rsquo;re published.</p>
      <Link href="/contact" className="btn-primary btn-md">Get in Touch</Link>
    </div>
  )
}
