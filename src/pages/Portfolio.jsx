import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Portfolio() {
  const [cases, setCases] = useState([])
  const [activeIndustry, setActiveIndustry] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('case_studies').select('*').eq('is_published', true).order('created_at', { ascending: false })
      .then(({ data }) => { setCases(data || []); setLoading(false) })
  }, [])

  const industries = ['All', ...new Set(cases.map(c => c.industry).filter(Boolean))]
  const filtered = activeIndustry === 'All' ? cases : cases.filter(c => c.industry === activeIndustry)

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Portfolio</span>
          <h1 className="text-4xl font-bold text-white mt-2 mb-3">Case Studies</h1>
          <p className="text-gray-400">Real campaigns. Real results. Here's how I've helped brands grow.</p>
        </div>

        {/* Industry filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {industries.map(ind => (
            <button
              key={ind}
              onClick={() => setActiveIndustry(ind)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeIndustry === ind
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#111827] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">📁</p>
            <p>Case studies coming soon. Check back later.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <Link
                key={c.id}
                to={`/portfolio/${c.id}`}
                className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all group block"
              >
                {c.cover_image_url ? (
                  <img src={c.cover_image_url} alt={c.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
                    <span className="text-4xl">📊</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full font-medium">{c.industry}</span>
                    {c.is_featured && <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full">Featured</span>}
                  </div>
                  <h3 className="text-white font-semibold mb-1.5">{c.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{c.client_name}</p>
                  {c.key_metrics && (
                    <div className="flex gap-4">
                      {Object.entries(c.key_metrics).slice(0, 2).map(([k, v]) => (
                        <div key={k}>
                          <div className="text-lg font-bold text-blue-400">{v}</div>
                          <div className="text-gray-500 text-xs">{k}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="text-blue-400 text-sm font-medium mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read case study <span>→</span>
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
