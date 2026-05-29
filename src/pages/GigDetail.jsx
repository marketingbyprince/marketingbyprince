import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MilestoneList from '../components/ui/MilestoneList'

const tierOrder  = ['starter', 'standard', 'premium']
const tierLabels = { starter: 'Starter', standard: 'Standard', premium: 'Premium' }

export default function GigDetail() {
  const { id } = useParams()
  const [gig,      setGig]      = useState(null)
  const [packages, setPackages] = useState([])
  const [loading,  setLoading]  = useState(true)

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
    <div className="min-h-screen flex items-center justify-center bg-soft">
      <div className="spinner" />
    </div>
  )

  if (!gig) return (
    <div className="min-h-screen flex items-center justify-center bg-soft">
      <div className="text-center">
        <p className="text-body text-gray-500 mb-4">Gig not found.</p>
        <Link to="/gigs" className="text-body-sm font-bold" style={{ color: 'var(--accent)' }}>
          &larr; Back to Gigs
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-narrow">

        <Link to="/gigs"
              className="text-body-sm font-semibold text-gray-400 hover:text-accent flex items-center gap-1 mb-8 transition-colors">
          &larr; Back to Gigs
        </Link>

        <div className="mb-10">
          <span className="badge-accent mb-4 inline-block">{gig.category}</span>
          <h1 className="heading-display text-deep mt-2 mb-4">{gig.title}</h1>
          <p className="text-body text-gray-500 max-w-2xl leading-relaxed">{gig.short_description}</p>
        </div>

        {/* Package cards */}
        {packages.length > 0 ? (
          <div className="grid sm:grid-cols-3 gap-5 mb-12">
            {packages.map(pkg => {
              const isPopular = pkg.tier === 'standard'
              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col rounded-2xl p-6 border-2 transition-all ${
                    isPopular
                      ? 'bg-white border-accent shadow-accent'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-extrabold text-white px-3 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--accent)' }}>
                      Most Popular
                    </span>
                  )}

                  <div className="mb-6">
                    <h3 className="heading-pkg mb-3"
                        style={isPopular ? { color: 'var(--accent)' } : {}}>
                      {tierLabels[pkg.tier]}
                    </h3>
                    <div className="text-price-val mb-1">₹{pkg.price?.toLocaleString()}</div>
                    <p className="text-body-sm text-gray-400 font-medium">
                      ⏱ {pkg.delivery_days} days delivery
                    </p>
                  </div>

                  {pkg.milestones?.length > 0 && (
                    <MilestoneList items={pkg.milestones} className="flex-1 mb-6" />
                  )}

                  <Link
                    to={`/contact?subject=${encodeURIComponent(`Order: ${gig.title} — ${tierLabels[pkg.tier]}`)}`}
                    className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                      isPopular
                        ? 'text-white hover:opacity-90'
                        : 'border-2 border-gray-200 text-deep hover:border-accent hover:text-accent'
                    }`}
                    style={isPopular ? { backgroundColor: 'var(--accent)' } : {}}
                  >
                    Order Now
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card p-10 text-center mb-12">
            <p className="text-body text-gray-400 mb-4">Package details coming soon.</p>
            <Link to="/contact" className="text-body-sm font-bold" style={{ color: 'var(--accent)' }}>
              Contact me for pricing &rarr;
            </Link>
          </div>
        )}

        {/* Custom CTA */}
        <div className="rounded-2xl p-8 text-center"
             style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
          <h3 className="heading-section mb-2">Need a custom solution?</h3>
          <p className="text-body text-gray-500 mb-6">
            I can tailor any package to fit your exact needs and budget.
          </p>
          <Link to="/contact" className="btn-primary btn-lg">Let&rsquo;s Discuss</Link>
        </div>

      </div>
    </div>
  )
}
