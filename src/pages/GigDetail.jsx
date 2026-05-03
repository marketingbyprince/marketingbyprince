import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const tierOrder = ['starter', 'standard', 'premium']
const tierLabels = { starter: 'Starter', standard: 'Standard', premium: 'Premium' }
const tierColors = {
  starter: 'border-gray-800',
  standard: 'border-blue-500',
  premium: 'border-purple-500',
}

export default function GigDetail() {
  const { id } = useParams()
  const [gig, setGig] = useState(null)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('gigs').select('*').eq('id', id).single(),
      supabase.from('gig_packages').select('*').eq('gig_id', id),
    ]).then(([{ data: gigData }, { data: pkgData }]) => {
      setGig(gigData)
      setPackages((pkgData || []).sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)))
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!gig) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Gig not found.</p>
        <Link to="/gigs" className="text-blue-400 hover:underline">← Back to Gigs</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link to="/gigs" className="text-gray-500 hover:text-white text-sm flex items-center gap-1 mb-8 transition-colors">
          ← Back to Gigs
        </Link>

        <div className="mb-10">
          <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">{gig.category}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-4">{gig.title}</h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">{gig.short_description}</p>
        </div>

        {/* Package table */}
        {packages.length > 0 ? (
          <div className="grid sm:grid-cols-3 gap-5 mb-12">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className={`bg-[#111827] border-2 rounded-2xl p-6 flex flex-col relative ${tierColors[pkg.tier]} ${
                  pkg.tier === 'standard' ? 'ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/10' : ''
                }`}
              >
                {pkg.tier === 'standard' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white bg-blue-500 px-3 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}

                <div className="mb-5">
                  <h3 className="text-white font-bold text-lg">{tierLabels[pkg.tier]}</h3>
                  <div className="text-3xl font-extrabold text-white mt-2">
                    ₹{pkg.price?.toLocaleString()}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">⏱ {pkg.delivery_days} days delivery</p>
                </div>

                {pkg.milestones?.length > 0 && (
                  <ul className="space-y-2 flex-1 mb-6">
                    {pkg.milestones.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-blue-400 mt-0.5 shrink-0">✓</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  to={`/contact?subject=${encodeURIComponent(`Order: ${gig.title} — ${tierLabels[pkg.tier]}`)}`}
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    pkg.tier === 'standard'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'border border-gray-700 hover:border-blue-500/60 text-gray-300 hover:text-white'
                  }`}
                >
                  Order Now
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-10 text-center mb-12">
            <p className="text-gray-400 mb-4">Package details coming soon.</p>
            <Link to="/contact" className="text-blue-400 hover:underline text-sm">Contact me for pricing →</Link>
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-2">Need a custom solution?</h3>
          <p className="text-gray-400 mb-6">I can tailor any package to fit your exact needs and budget.</p>
          <Link to="/contact" className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors">
            Let's Discuss
          </Link>
        </div>
      </div>
    </div>
  )
}
