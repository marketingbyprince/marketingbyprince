'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useCurrency } from '@/hooks/useCurrency'
import CurrencySelector from '@/components/CurrencySelector'

const TIER_ORDER = ['starter', 'standard', 'premium']

export default function GigDetailClient({ params }) {
  const id = params.slug

  const [gig,             setGig]             = useState(null)
  const [packages,        setPackages]        = useState([])
  const [addons,          setAddons]          = useState([])
  const [platforms,       setPlatforms]       = useState([])
  const [loading,         setLoading]         = useState(true)
  const [selPkgId,        setSelPkgId]        = useState(null)
  // Map of addonId -> quantity (0 means not selected)
  const [addonQty,        setAddonQty]        = useState({})
  const [selPlatformIds,  setSelPlatformIds]  = useState(() => new Set())
  const [form,            setForm]            = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [status,          setStatus]          = useState('idle')
  const { currency, setCurrency, format }     = useCurrency()

  const packagesRef    = useRef(null)
  const exploreMoreRef = useRef(null)

  useEffect(() => {
    async function load() {
      let { data: g } = await supabase.from('gigs').select('*').eq('slug', id).single()
      if (!g) {
        const { data: byId } = await supabase.from('gigs').select('*').eq('id', id).single()
        g = byId
      }
      if (!g) { setLoading(false); return }

      const gigId = g.id
      const [{ data: pkgs }, { data: ads }, { data: plats }] = await Promise.all([
        supabase.from('gig_packages').select('*').eq('gig_id', gigId).eq('is_active', true),
        supabase.from('gig_addons').select('*').eq('gig_id', gigId).eq('is_active', true).order('sort_order'),
        supabase.from('platforms').select('*').eq('is_active', true).order('sort_order'),
      ])
      setGig(g)
      setPackages((pkgs || []).sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)))
      setAddons(ads || [])

      // Filter platforms to only ones allowed for this gig (if set)
      const allowedIds = g.allowed_platform_ids
      const filteredPlats = (allowedIds && allowedIds.length > 0)
        ? (plats || []).filter(p => allowedIds.includes(p.id))
        : (plats || [])
      setPlatforms(filteredPlats)
      setLoading(false)
    }
    load()
  }, [id])

  const selPkgObj       = useMemo(() => packages.find(p => p.id === selPkgId) ?? null, [packages, selPkgId])
  const selPlatformObjs = useMemo(() => platforms.filter(p => selPlatformIds.has(p.id)), [platforms, selPlatformIds])

  // Addons with quantities > 0
  const selAddonEntries = useMemo(() =>
    addons.flatMap(a => {
      const qty = addonQty[a.id] || 0
      return qty > 0 ? [{ addon: a, qty }] : []
    }), [addons, addonQty])

  const basePrice  = selPkgObj ? (selPkgObj.price || 0) * (selPlatformIds.size || 1) : 0
  const addonTotal = selAddonEntries.reduce((s, { addon, qty }) => s + (addon.price || 0) * qty, 0)
  const grandTotal = basePrice + addonTotal
  const hasSelection = !!(selPkgObj || selAddonEntries.length || selPlatformObjs.length)

  const setAddonQuantity = useCallback((addonId, qty) => {
    setAddonQty(prev => ({ ...prev, [addonId]: Math.max(0, qty) }))
  }, [])

  const togglePlatform = useCallback(platId =>
    setSelPlatformIds(prev => { const s = new Set(prev); s.has(platId) ? s.delete(platId) : s.add(platId); return s }), [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.email) return
    setStatus('loading')
    const { error } = await supabase.from('leads').insert([{
      name: form.name, email: form.email,
      phone: form.phone || null, company: form.company || null, message: form.message || null,
      source_page: `/gigs/${id}`, selected_gig_id: gig.id, selected_gig_package_id: selPkgId || null,
      selected_addons: selAddonEntries.length
        ? selAddonEntries.map(({ addon, qty }) => ({ id: addon.id, name: addon.name, price: addon.price, qty }))
        : null,
      selected_platforms: selPlatformObjs.length ? selPlatformObjs.map(p => ({ id: p.id, name: p.name })) : null,
      estimated_price: grandTotal > 0 ? grandTotal : null, is_read: false,
    }])
    setStatus(error ? 'error' : 'success')
  }

  const scrollToPackages   = () => packagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToExplore    = () => exploreMoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-soft"><div className="spinner" /></div>
  if (!gig)    return (
    <div className="min-h-screen flex items-center justify-center bg-soft">
      <div className="text-center">
        <p className="text-body text-gray-500 mb-4">Gig not found.</p>
        <Link href="/gigs" className="btn-primary btn-md">← Back to Gigs</Link>
      </div>
    </div>
  )

  const stepBase = platforms.length > 0 ? 1 : 0

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-narrow">
        <Link href="/gigs" className="text-body-sm font-semibold text-gray-400 hover:text-accent flex items-center gap-1 mb-8 transition-colors">← Back to Gigs</Link>

        {/* Header */}
        <div className="mb-10">
          <span className="badge-accent mb-4 inline-block">{gig.category}</span>
          <h1 className="heading-display text-deep mt-2 mb-4">{gig.title}</h1>
          {gig.short_description && <p className="text-body text-gray-500 max-w-2xl leading-relaxed">{gig.short_description}</p>}

          {/* Intro paragraph — keyword-rich content editable from admin */}
          {gig.intro_paragraph && (
            <div className="prose-rte max-w-2xl mt-4 border-l-4 pl-4" style={{ borderColor: 'var(--accent)' }}
              dangerouslySetInnerHTML={{ __html: gig.intro_paragraph }} />
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            {platforms.length > 0 && (
              <p className="text-body-sm text-gray-400 font-medium inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                Price is <strong>per platform / month</strong> — select platforms below to calculate your total
              </p>
            )}
          </div>

          {/* CTA buttons + currency */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button onClick={scrollToPackages} className="btn-primary btn-md">
              View Packages
            </button>
            {gig.explore_more_content && (
              <button onClick={scrollToExplore}
                className="btn-md border-2 font-bold rounded-xl px-5 py-2.5 transition-all hover:opacity-80"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'transparent' }}>
                Explore More ↓
              </button>
            )}
            <CurrencySelector currency={currency} onChange={setCurrency} className="ml-auto" />
          </div>
        </div>

        {/* Step 1 — Platforms */}
        {platforms.length > 0 && (
          <section className="mb-14">
            <StepHeading step="1" title="Select Advertising Platforms" sub="Your package price multiplies by the number of platforms you choose" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {platforms.map(p => {
                const isSel = selPlatformIds.has(p.id)
                return (
                  <button key={p.id} onClick={() => togglePlatform(p.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${isSel ? 'border-accent shadow-sm' : 'bg-white border-gray-200 hover:border-accent/40'}`}
                    style={isSel ? { backgroundColor: 'var(--accent-muted)' } : {}}>
                    <div className="text-2xl mb-1.5 leading-none">{p.icon || '🌐'}</div>
                    <div className={`text-xs font-bold leading-tight ${isSel ? 'text-deep' : 'text-gray-600'}`}>{p.name}</div>
                  </button>
                )
              })}
            </div>
            {selPlatformIds.size > 0 && selPkgObj && (
              <div className="card p-4 border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
                <p className="text-body-sm text-gray-600">
                  <span className="font-extrabold text-deep">{selPlatformIds.size} platform{selPlatformIds.size > 1 ? 's' : ''}</span>
                  {' '}×{' '}<span className="font-bold">{format(selPkgObj.price || 0)}</span>{' '}={' '}
                  <span className="font-extrabold text-lg" style={{ color: 'var(--accent)' }}>{format(basePrice)}/mo base</span>
                </p>
                <p className="text-xs text-gray-400 mt-1 font-medium">Platforms: {selPlatformObjs.map(p => p.name).join(', ')}</p>
              </div>
            )}
          </section>
        )}

        {/* Step 2 — Packages */}
        {packages.length > 0 && (
          <section className="mb-14" ref={packagesRef}>
            <StepHeading step={String(stepBase + 1)} title="Choose Your Package" />
            <div className="grid sm:grid-cols-3 gap-5">
              {packages.map(pkg => {
                const isSelected = selPkgId === pkg.id
                const isFeatured = pkg.is_featured
                return (
                  <div key={pkg.id} onClick={() => setSelPkgId(isSelected ? null : pkg.id)}
                    className={`relative flex flex-col rounded-2xl p-6 border-2 cursor-pointer select-none transition-all duration-150 ${isSelected ? 'border-accent shadow-accent' : isFeatured ? 'bg-white border-accent shadow-accent' : 'bg-white border-gray-200 hover:border-accent/40'}`}
                    style={isSelected ? { backgroundColor: 'var(--accent-muted)' } : {}}>
                    {isFeatured && !isSelected && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-extrabold text-white px-3 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: 'var(--accent)' }}>Most Popular</span>}
                    {isSelected && <span className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'var(--accent)' }}>✓</span>}
                    <span className={`text-xs font-extrabold uppercase tracking-wider mb-2 ${isFeatured || isSelected ? 'text-accent' : 'text-gray-400'}`}>{pkg.tier}</span>
                    <h3 className="font-extrabold text-deep text-base leading-snug mb-4">{pkg.name || pkg.tier}</h3>
                    <div className="mb-5">
                      <div className="text-price-val" style={isFeatured || isSelected ? { color: 'var(--accent)' } : {}}>{format(pkg.price || 0)}</div>
                      <p className="text-body-sm text-gray-400 font-medium mt-0.5">per platform / mo</p>
                      {pkg.delivery_days && <p className="text-body-sm text-gray-400 font-medium mt-1">⏱ {pkg.delivery_days}-day setup</p>}
                    </div>
                    {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                      <ul className="flex-1 space-y-2 mb-6">
                        {pkg.features.map((f, i) => <li key={i} className="flex items-start gap-2 text-body-sm text-gray-600"><span className="shrink-0 mt-0.5 font-bold" style={{ color: 'var(--accent)' }}>✓</span>{f}</li>)}
                      </ul>
                    )}
                    <div className={`mt-auto text-center py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${isSelected || isFeatured ? 'text-white border-transparent' : 'border-gray-200 text-deep hover:border-accent hover:text-accent'}`} style={isSelected || isFeatured ? { backgroundColor: 'var(--accent)' } : {}}>
                      {isSelected ? 'Selected ✓' : 'Select Package'}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Step 3 — Add-Ons with quantity */}
        {addons.length > 0 && (
          <section className="mb-14">
            <StepHeading step={String(stepBase + 2)} title="Add-Ons" sub="Optional extras — select and adjust quantity as needed" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addons.map(addon => {
                const qty      = addonQty[addon.id] || 0
                const isSel    = qty > 0
                const maxQty   = addon.max_quantity || 1
                const unitPrice = addon.price || 0
                return (
                  <div key={addon.id}
                    className={`card text-left p-5 transition-all ${isSel ? 'border-accent' : 'hover:border-accent/30'}`}
                    style={isSel ? { backgroundColor: 'var(--accent-muted)' } : {}}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-xl shrink-0">{addon.icon || '🧩'}</span>
                        <span className="font-bold text-sm text-deep leading-snug">{addon.name}</span>
                      </div>
                      {unitPrice > 0 && (
                        <span className="text-xs font-extrabold shrink-0" style={{ color: 'var(--accent)' }}>
                          +{format(unitPrice * (qty || 1))}{qty > 1 ? ` (${qty}×${format(unitPrice)})` : '/ea'}
                        </span>
                      )}
                    </div>
                    {addon.description && <p className="text-body-sm text-gray-500 leading-relaxed mt-1 mb-3">{addon.description}</p>}

                    {/* Quantity control */}
                    {maxQty > 1 ? (
                      <div className="flex items-center gap-2 mt-2">
                        <button type="button" onClick={() => setAddonQuantity(addon.id, qty - 1)}
                          className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all"
                          style={isSel ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : { borderColor: '#D1D5DB', color: '#9CA3AF' }}>
                          −
                        </button>
                        <span className={`text-sm font-bold w-5 text-center ${isSel ? 'text-deep' : 'text-gray-400'}`}>{qty}</span>
                        <button type="button" onClick={() => setAddonQuantity(addon.id, qty + 1)}
                          disabled={qty >= maxQty}
                          className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30"
                          style={qty < maxQty ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}>
                          +
                        </button>
                        <span className="text-xs text-gray-400 ml-1">/ max {maxQty}</span>
                      </div>
                    ) : (
                      /* Single-quantity: simple toggle */
                      <button type="button" onClick={() => setAddonQuantity(addon.id, isSel ? 0 : 1)}
                        className="flex items-center gap-2 mt-2 text-xs font-semibold transition-all"
                        style={isSel ? { color: 'var(--accent)' } : { color: '#9CA3AF' }}>
                        <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all"
                          style={isSel ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' } : { borderColor: '#D1D5DB', color: 'transparent' }}>✓</span>
                        {isSel ? 'Added' : 'Add'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Inquiry form */}
        <section className="mb-14">
          <div className="card p-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
            {hasSelection && (
              <div className="mb-8 pb-6 border-b border-gray-100">
                <h3 className="heading-section mb-5">Your Quote Summary</h3>
                <div className="space-y-2.5">
                  {selPkgObj && <SummaryRow label={`${selPkgObj.name || selPkgObj.tier} × ${selPlatformIds.size || 1} platform${(selPlatformIds.size || 1) > 1 ? 's' : ''}`} value={`${format(basePrice)}/mo`} />}
                  {selAddonEntries.map(({ addon, qty }) => (
                    <SummaryRow key={addon.id}
                      label={qty > 1 ? `${addon.name} × ${qty}` : addon.name}
                      value={addon.price > 0 ? `+${format(addon.price * qty)}` : 'Included'} />
                  ))}
                  {selPlatformObjs.length > 0 && <p className="text-xs text-gray-400 pt-1">Platforms: {selPlatformObjs.map(p => p.name).join(' · ')}</p>}
                </div>
                {grandTotal > 0 && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-500">Estimated Monthly Investment</span>
                    <span className="text-price-val" style={{ color: 'var(--accent)' }}>{format(grandTotal)}</span>
                  </div>
                )}
              </div>
            )}
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="heading-section mb-2">Inquiry Sent!</h3>
                <p className="text-body text-gray-500">I&rsquo;ll get back to you within 24 hours with a detailed proposal.</p>
              </div>
            ) : (
              <>
                <h3 className="heading-section mb-5">Send Your Inquiry</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="input-label">Name *</label><input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className="input-field" /></div>
                    <div><label className="input-label">Email *</label><input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@company.com" className="input-field" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="input-label">Phone</label><input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" className="input-field" /></div>
                    <div><label className="input-label">Company</label><input type="text" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Your company (optional)" className="input-field" /></div>
                  </div>
                  <div><label className="input-label">Message (optional)</label><textarea rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Any specific requirements or questions..." className="input-field resize-none" /></div>
                  {!selPkgObj && <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: 'var(--warn-canvas)', color: '#92400E', border: '1px solid var(--warn-border)' }}>💡 Select a package above to include it in your inquiry.</div>}
                  {status === 'error' && <p className="text-red-600 text-body-sm font-medium">Something went wrong. Please try again or email directly.</p>}
                  <button type="submit" disabled={status === 'loading'} className="btn-primary btn-lg w-full justify-center">{status === 'loading' ? 'Sending…' : 'Send Inquiry'}</button>
                </form>
              </>
            )}
          </div>
        </section>

        {/* Explore More section */}
        {gig.explore_more_content && (
          <section ref={exploreMoreRef} className="mb-14 scroll-mt-28">
            <div className="card p-8">
              <h2 className="heading-section mb-6" style={{ color: 'var(--accent)' }}>Explore More About This Service</h2>
              <div
                className="prose-rte"
                dangerouslySetInnerHTML={{ __html: gig.explore_more_content || '' }}
              />
            </div>
          </section>
        )}

        {/* Custom solution CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
          <h3 className="heading-section mb-2">Need a custom solution?</h3>
          <p className="text-body text-gray-500 mb-6">I can tailor any package to fit your exact needs and budget.</p>
          <Link href="/contact" className="btn-primary btn-lg">Let&rsquo;s Discuss</Link>
        </div>
      </div>
    </div>
  )
}

function StepHeading({ step, title, sub }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0 mt-0.5" style={{ backgroundColor: 'var(--accent)' }}>{step}</span>
      <div>
        <h2 className="heading-section text-deep">{title}</h2>
        {sub && <p className="text-body-sm text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-600 flex-1">{label}</span>
      <span className="text-sm font-bold text-deep shrink-0">{value}</span>
    </div>
  )
}
