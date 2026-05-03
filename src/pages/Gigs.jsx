import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Gigs() {
  const [gigs, setGigs] = useState([])
  const [packages, setPackages] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('gigs').select('*').eq('is_active', true).order('category'),
      supabase.from('gig_packages').select('*').eq('tier', 'starter'),
    ]).then(([{ data: gigsData }, { data: pkgData }]) => {
      setGigs(gigsData || [])
      setPackages(pkgData || [])
      setLoading(false)
    })
  }, [])

  const categories = ['All', ...new Set(gigs.map(g => g.category).filter(Boolean))]
  const filtered = activeCategory === 'All' ? gigs : gigs.filter(g => g.category === activeCategory)

  const getStarterPkg = gigId => packages.find(p => p.gig_id === gigId)

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Freelance Gigs</span>
          <h1 className="text-4xl font-bold text-white mt-2 mb-3">Packaged Services</h1>
          <p className="text-gray-400">Fixed-scope deliverables with transparent pricing. Pick a package and let's get started.</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#111827] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">🚧</p>
            <p>Gigs coming soon. <Link to="/contact" className="text-blue-400 hover:underline">Contact me</Link> for custom work.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(gig => {
              const pkg = getStarterPkg(gig.id)
              return (
                <div key={gig.id} className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all group flex flex-col">
                  {gig.cover_image_url ? (
                    <img src={gig.cover_image_url} alt={gig.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-4xl">
                      📦
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
                        {gig.category}
                      </span>
                      {pkg && (
                        <span className="text-xs text-gray-400">
                          from <span className="text-white font-semibold">₹{pkg.price?.toLocaleString()}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold mb-2">{gig.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed flex-1">{gig.short_description}</p>
                    {pkg && (
                      <p className="text-gray-500 text-xs mt-3">⏱ Delivery in {pkg.delivery_days} days</p>
                    )}
                    <Link
                      to={`/gigs/${gig.id}`}
                      className="mt-5 block w-full text-center py-2.5 border border-blue-500/50 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl text-sm font-medium transition-all"
                    >
                      View Package
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
