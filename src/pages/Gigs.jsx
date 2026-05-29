import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SectionHeader from '../components/ui/SectionHeader'

export default function Gigs() {
  const [gigs,           setGigs]           = useState([])
  const [packages,       setPackages]       = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading,        setLoading]        = useState(true)

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

  const categories   = ['All', ...new Set(gigs.map(g => g.category).filter(Boolean))]
  const filtered     = activeCategory === 'All' ? gigs : gigs.filter(g => g.category === activeCategory)
  const getStarterPkg = gigId => packages.find(p => p.gig_id === gigId)

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-wrap">

        <SectionHeader
          eyebrow="Freelance Gigs"
          title="Packaged Services"
          subtitle="Fixed-scope deliverables with transparent pricing. Pick a package and let's get started."
        />

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? 'filter-pill-on' : 'filter-pill-off'}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🚧</p>
            <p className="text-body">
              Gigs coming soon.{' '}
              <Link to="/contact" className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>
                Contact me
              </Link>{' '}
              for custom work.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(gig => {
              const pkg = getStarterPkg(gig.id)
              return (
                <div key={gig.id} className="card-interactive overflow-hidden flex flex-col group">
                  {gig.cover_image_url ? (
                    <img src={gig.cover_image_url} alt={gig.title}
                         className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 flex items-center justify-center text-4xl"
                         style={{ background: 'var(--accent-muted)' }}>
                      📦
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="badge-accent">{gig.category}</span>
                      {pkg && (
                        <span className="text-xs text-gray-400 font-medium">
                          from{' '}
                          <span className="font-black text-deep">₹{pkg.price?.toLocaleString()}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="heading-section mb-2">{gig.title}</h3>
                    <p className="text-body text-gray-500 leading-relaxed flex-1">
                      {gig.short_description}
                    </p>
                    {pkg && (
                      <p className="text-body-sm text-gray-400 mt-3 font-medium">
                        ⏱ Delivery in {pkg.delivery_days} days
                      </p>
                    )}
                    <Link
                      to={`/gigs/${gig.id}`}
                      className="mt-5 block w-full text-center btn btn-md border-2 border-accent text-accent hover:bg-accent hover:text-white transition-all"
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
