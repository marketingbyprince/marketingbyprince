import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const fallbackPillars = [
  { id: 'perf', title: 'Performance Marketing', icon: '🎯' },
  { id: 'analytics', title: 'Analytics & Tracking', icon: '📊' },
  { id: 'kam', title: 'Key Account Management', icon: '🤝' },
  { id: 'seo', title: 'SEO & Content', icon: '🔍' },
  { id: 'social', title: 'Social Media', icon: '📱' },
  { id: 'auto', title: 'Marketing Automation', icon: '⚡' },
]

export default function Services() {
  const [services, setServices] = useState([])
  const [search, setSearch] = useState('')
  const [activePillar, setActivePillar] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).order('pillar')
      .then(({ data }) => { setServices(data || []); setLoading(false) })
  }, [])

  const pillars = ['All', ...new Set(services.map(s => s.pillar).filter(Boolean))]

  const filtered = services.filter(s => {
    const matchesPillar = activePillar === 'All' || s.pillar === activePillar
    const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase())
    return matchesPillar && matchesSearch
  })

  const grouped = filtered.reduce((acc, s) => {
    const key = s.pillar || 'General'
    acc[key] = acc[key] || []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Services</span>
          <h1 className="text-4xl font-bold text-white mt-2 mb-3">What I Offer</h1>
          <p className="text-gray-400">Performance-driven marketing services for brands that want to scale.</p>
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {(services.length ? pillars.filter(p => p !== 'All').map(p => ({ id: p, title: p, icon: '📌' })) : fallbackPillars).map(p => (
            <button
              key={p.id}
              onClick={() => setActivePillar(p.title === activePillar ? 'All' : p.title)}
              className={`p-4 rounded-xl border text-left transition-all ${
                activePillar === p.title || activePillar === p.id
                  ? 'border-blue-500/60 bg-blue-500/10 text-white'
                  : 'border-gray-800 bg-[#111827] text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="text-2xl mb-2">{p.icon}</div>
              <div className="text-xs font-medium leading-tight">{p.title}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full bg-[#111827] border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
        </div>

        {/* Services grouped by pillar */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20 text-gray-500">No services found.</div>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).map(([pillar, items]) => (
              <div key={pillar}>
                <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {pillar}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(s => (
                    <div key={s.id} className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-blue-500/40 transition-all">
                      <div className="text-2xl mb-3">{s.icon || '📌'}</div>
                      <h3 className="text-white font-medium mb-1.5">{s.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-4">{s.description}</p>
                      <Link
                        to={`/contact?subject=${encodeURIComponent(s.title)}`}
                        className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
                      >
                        Get Quote →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-2">Don't see what you need?</h3>
          <p className="text-gray-400 mb-6">Let's discuss a custom solution for your business.</p>
          <Link to="/contact" className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors">
            Talk to Me
          </Link>
        </div>
      </div>
    </div>
  )
}
