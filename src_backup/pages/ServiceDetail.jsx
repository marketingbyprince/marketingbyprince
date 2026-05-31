import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase }    from '../lib/supabase'
import ServiceCard     from '../components/ServiceCard'

// ── Tier ordering & labels ────────────────────────────────────────────────────

const TIER_ORDER  = ['starter', 'standard', 'premium', 'custom']
const TIER_LABEL  = { starter: 'Starter', standard: 'Standard', premium: 'Premium', custom: 'Custom / Enterprise' }
const FEATURED    = 'premium'   // gets "Most Popular" badge

// ── Platform count → recommended tier label ───────────────────────────────────

function platformRec(count) {
  if (count === 0) return null
  if (count === 1) return 'Starter'
  if (count === 2) return 'Standard'
  if (count <= 4)  return 'Premium'
  return 'Custom'
}

// ═════════════════════════════════════════════════════════════════════════════
//  Page
// ═════════════════════════════════════════════════════════════════════════════

export default function ServiceDetail() {
  const { slug } = useParams()

  // ── Data ───────────────────────────────────────────────────────
  const [service,   setService]   = useState(null)
  const [packages,  setPackages]  = useState([])
  const [addons,    setAddons]    = useState([])
  const [platforms, setPlatforms] = useState([])
  const [related,   setRelated]   = useState([])
  const [loading,   setLoading]   = useState(true)

  // ── Builder state (package + add-ons + platforms) ──────────────
  const [selPkgId,      setSelPkgId]      = useState(null)
  const [selAddonIds,   setSelAddonIds]   = useState(() => new Set())
  const [selPlatformIds,setSelPlatformIds]= useState(() => new Set())
  const [addonFilter,   setAddonFilter]   = useState('All')

  // ── Fetch all data in parallel ─────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([
      supabase.from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single(),
      supabase.from('service_packages')
        .select('*')
        .eq('is_active', true),
      supabase.from('addons')
        .select('*')
        .eq('is_active', true)
        .order('category'),
      supabase.from('platforms')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]).then(async ([{ data: svc }, { data: pkgs }, { data: ads }, { data: plats }]) => {
      if (cancelled) return

      setService(svc)
      setPackages(
        (pkgs || []).sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))
      )
      setAddons(ads || [])
      setPlatforms(plats || [])

      if (svc?.pillar) {
        const { data: rel } = await supabase
          .from('services')
          .select('id, title, description, icon, pillar, slug')
          .eq('pillar', svc.pillar)
          .eq('is_active', true)
          .neq('id', svc.id)
          .limit(3)
        if (!cancelled) setRelated(rel || [])
      }

      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [slug])

  // ── SEO ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!service) return
    document.title = `${service.title} | Marketing By Prince`
    const meta = document.querySelector('meta[name="description"]')
    if (meta && service.description)
      meta.setAttribute('content', service.description.substring(0, 160))
  }, [service])

  // ── Computed selections ────────────────────────────────────────
  const selPkgObj       = useMemo(() => packages.find(p => p.id === selPkgId) ?? null, [packages, selPkgId])
  const selAddonObjs    = useMemo(() => addons.filter(a => selAddonIds.has(a.id)),      [addons, selAddonIds])
  const selPlatformObjs = useMemo(() => platforms.filter(p => selPlatformIds.has(p.id)),[platforms, selPlatformIds])

  const addonTotal  = useMemo(() => selAddonObjs.reduce((s, a) => s + (a.price || 0), 0), [selAddonObjs])
  const grandTotal  = (selPkgObj?.price || 0) + addonTotal
  const hasSelection = !!(selPkgObj || selAddonObjs.length || selPlatformObjs.length)

  const addonCategories = useMemo(
    () => ['All', ...new Set(addons.map(a => a.category).filter(Boolean))],
    [addons]
  )
  const filteredAddons = useMemo(
    () => addonFilter === 'All' ? addons : addons.filter(a => a.category === addonFilter),
    [addons, addonFilter]
  )
  const recommendation = platformRec(selPlatformIds.size)

  const inquiryUrl = useMemo(() => {
    if (!service) return '/contact'
    const parts = [service.title]
    if (selPkgObj)
      parts.push(`Package: ${selPkgObj.name || TIER_LABEL[selPkgObj.tier] || 'Selected'}`)
    if (selPlatformObjs.length)
      parts.push(`Platforms: ${selPlatformObjs.map(p => p.name).join(', ')}`)
    if (selAddonObjs.length)
      parts.push(`Add-ons: ${selAddonObjs.map(a => a.title).join(', ')}`)
    return `/contact?subject=${encodeURIComponent(parts.join(' | '))}`
  }, [service, selPkgObj, selPlatformObjs, selAddonObjs])

  // ── Toggles ────────────────────────────────────────────────────
  const toggleAddon = useCallback(id =>
    setSelAddonIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s }),
  [])
  const togglePlatform = useCallback(id =>
    setSelPlatformIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s }),
  [])
  const clearAll = useCallback(() => {
    setSelPkgId(null)
    setSelAddonIds(new Set())
    setSelPlatformIds(new Set())
  }, [])

  // ── Loading skeleton ───────────────────────────────────────────
  if (loading) return <LoadingSkeleton />

  // ── 404 ────────────────────────────────────────────────────────
  if (!service) return (
    <div className="min-h-screen flex items-center justify-center bg-soft px-4">
      <div className="text-center">
        <div className="text-5xl mb-5">🔍</div>
        <h2 className="heading-section mb-2 text-gray-600">Service not found</h2>
        <p className="text-body text-gray-400 mb-8 max-w-sm mx-auto">
          This service may have moved or been removed.
        </p>
        <Link to="/services" className="btn-primary btn-lg">Browse Services</Link>
      </div>
    </div>
  )

  // ── Page render ────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-narrow">

        {/* ── Breadcrumb ───────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold mb-8">
          <Link to="/services"
                className="hover:text-accent transition-colors"
                style={{ color: 'var(--color-subtle)' }}>
            Services
          </Link>
          {service.pillar && <>
            <span style={{ color: 'var(--color-subtle)' }}>›</span>
            <span style={{ color: 'var(--color-muted)' }}>{service.pillar}</span>
          </>}
          <span style={{ color: 'var(--color-subtle)' }}>›</span>
          <span style={{ color: 'var(--color-text-2)' }}>{service.title}</span>
        </nav>

        {/* ── 1 · Hero ─────────────────────────────────────────── */}
        <article className="card p-8 mb-12" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                 style={{ backgroundColor: 'var(--accent-muted)' }}>
              {service.icon || '📌'}
            </div>
            <div className="flex-1 min-w-0">
              {service.pillar && <span className="eyebrow mb-2">{service.pillar}</span>}
              <h1 className="heading-display text-deep mt-2 mb-4">{service.title}</h1>
              {service.description && (
                <p className="text-body text-gray-500 leading-relaxed max-w-2xl">
                  {service.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to={inquiryUrl} className="btn-primary btn-md">Get a Quote</Link>
                <Link to="/services" className="btn-ghost btn-md">← All Services</Link>
              </div>
            </div>
          </div>
        </article>

        {/* ── 2 · Packages ─────────────────────────────────────── */}
        {packages.length > 0 && (
          <section aria-labelledby="packages-heading" className="mb-16">
            <SectionHeading id="packages-heading" label="Packages &amp; Pricing">
              Select a package below to add it to your custom quote.
            </SectionHeading>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {packages.map(pkg => {
                const isFeatured = pkg.tier === FEATURED
                const isCustom   = pkg.tier === 'custom'
                const isSelected = selPkgId === pkg.id

                let cardCls = 'relative flex flex-col rounded-2xl p-6 border-2 transition-all duration-150 cursor-pointer select-none '
                if (isSelected)       cardCls += 'border-accent shadow-accent'
                else if (isFeatured)  cardCls += 'border-accent bg-white shadow-accent'
                else if (isCustom)    cardCls += 'border-dashed border-gray-300 bg-white hover:border-accent/40'
                else                  cardCls += 'border-gray-200 bg-white hover:border-accent/40'

                const bgStyle = isSelected ? { backgroundColor: 'var(--accent-muted)' } : {}

                return (
                  <div key={pkg.id} className={cardCls} style={bgStyle}
                       onClick={() => setSelPkgId(isSelected ? null : pkg.id)}>

                    {/* Most Popular badge */}
                    {isFeatured && !isSelected && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-extrabold text-white px-3 py-0.5 rounded-full whitespace-nowrap"
                            style={{ backgroundColor: 'var(--accent)' }}>
                        Most Popular
                      </span>
                    )}

                    {/* Selected checkmark */}
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: 'var(--accent)' }}>
                        ✓
                      </span>
                    )}

                    {/* Tier label */}
                    <span className={`text-xs font-extrabold uppercase tracking-wider mb-3 ${
                      isFeatured || isSelected ? 'text-accent' : 'text-gray-400'
                    }`}>
                      {TIER_LABEL[pkg.tier] || pkg.tier}
                    </span>

                    {/* Package name */}
                    {pkg.name && (
                      <h3 className="font-extrabold text-deep text-base leading-snug mb-4">{pkg.name}</h3>
                    )}

                    {/* Price */}
                    <div className="mb-4">
                      {isCustom || !pkg.price ? (
                        <p className="text-2xl font-extrabold text-deep">Custom</p>
                      ) : (
                        <>
                          <p className="text-price-val"
                             style={isFeatured || isSelected ? { color: 'var(--accent)' } : {}}>
                            ₹{Number(pkg.price).toLocaleString('en-IN')}
                          </p>
                          {pkg.delivery_days && (
                            <p className="text-body-sm text-gray-400 font-medium mt-0.5">
                              ⏱ {pkg.delivery_days} day{pkg.delivery_days !== 1 ? 's' : ''} delivery
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Short description */}
                    {pkg.description && (
                      <p className="text-body-sm text-gray-500 leading-relaxed mb-4">{pkg.description}</p>
                    )}

                    {/* Features list */}
                    {pkg.features?.length > 0 && (
                      <ul className="flex-1 space-y-2 mb-6">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-body-sm text-gray-600">
                            <span className="shrink-0 mt-0.5 font-bold" style={{ color: 'var(--accent)' }}>✓</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* CTA */}
                    <Link
                      to={`/contact?subject=${encodeURIComponent(`${service.title} — ${pkg.name || TIER_LABEL[pkg.tier]}`)}`}
                      onClick={e => e.stopPropagation()}
                      className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all mt-auto ${
                        isSelected || isFeatured
                          ? 'text-white hover:opacity-90'
                          : isCustom
                            ? 'border-2 border-gray-300 text-gray-600 hover:border-accent hover:text-accent'
                            : 'border-2 border-gray-200 text-deep hover:border-accent hover:text-accent'
                      }`}
                      style={isSelected || isFeatured ? { backgroundColor: 'var(--accent)' } : {}}
                    >
                      {isCustom ? 'Request Quote' : 'Get Started'}
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── 3 · Add-ons ──────────────────────────────────────── */}
        {addons.length > 0 && (
          <section aria-labelledby="addons-heading" className="mb-16">
            <SectionHeading id="addons-heading" label="Add-ons">
              Enhance your package with optional extras. Click to include in your quote.
            </SectionHeading>

            {/* Category filter */}
            {addonCategories.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {addonCategories.map(cat => (
                  <button key={cat}
                          onClick={() => setAddonFilter(cat)}
                          className={cat === addonFilter ? 'filter-pill-on' : 'filter-pill-off'}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAddons.map(addon => {
                const isSel = selAddonIds.has(addon.id)
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`card text-left p-5 transition-all ${
                      isSel ? 'border-accent' : 'hover:border-accent/30'
                    }`}
                    style={isSel ? { backgroundColor: 'var(--accent-muted)' } : {}}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-xl leading-none shrink-0">{addon.icon || '🧩'}</span>
                        <span className="font-bold text-sm text-deep leading-snug truncate">
                          {addon.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {addon.price && (
                          <span className="text-xs font-extrabold" style={{ color: 'var(--accent)' }}>
                            +₹{Number(addon.price).toLocaleString('en-IN')}
                          </span>
                        )}
                        <span
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all shrink-0"
                          style={isSel
                            ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }
                            : { borderColor: '#D1D5DB', color: 'transparent' }}
                        >✓</span>
                      </div>
                    </div>

                    {addon.category && (
                      <span className="badge-gray text-xs mb-2">{addon.category}</span>
                    )}
                    {addon.description && (
                      <p className="text-body-sm text-gray-500 leading-relaxed mt-2">
                        {addon.description}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* ── 4 · Platform Calculator ──────────────────────────── */}
        {platforms.length > 0 && (
          <section aria-labelledby="platforms-heading" className="mb-16">
            <SectionHeading id="platforms-heading" label="Platform Calculator">
              Select the advertising platforms you want to target — get a package recommendation instantly.
            </SectionHeading>

            {/* Platform tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
              {platforms.map(p => {
                const isSel = selPlatformIds.has(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      isSel
                        ? 'border-accent shadow-sm'
                        : 'bg-white border-gray-200 hover:border-accent/40'
                    }`}
                    style={isSel ? { backgroundColor: 'var(--accent-muted)' } : {}}
                  >
                    <div className="text-2xl mb-1.5 leading-none">{p.icon || '🌐'}</div>
                    <div className={`text-xs font-bold leading-tight ${isSel ? 'text-deep' : 'text-gray-600'}`}>
                      {p.name}
                    </div>
                    {p.category && (
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-subtle)' }}>
                        {p.category}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Recommendation panel */}
            {recommendation ? (
              <div className="card p-6 border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-wider mb-1"
                       style={{ color: 'var(--accent)' }}>
                      Based on {selPlatformIds.size} platform{selPlatformIds.size !== 1 ? 's' : ''} selected
                    </p>
                    <p className="font-extrabold text-deep text-lg leading-snug mb-3">
                      {recommendation} package recommended
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selPlatformObjs.map(p => (
                        <span key={p.id} className="badge-gray">
                          {p.icon && <span className="mr-1">{p.icon}</span>}{p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    to={`/contact?subject=${encodeURIComponent(
                      `${service.title} | ${recommendation} Package | Platforms: ${selPlatformObjs.map(p => p.name).join(', ')}`
                    )}`}
                    className="btn-primary btn-md shrink-0"
                  >
                    Build This Package
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-5 text-center">
                <p className="text-body-sm font-semibold text-gray-400">
                  Select one or more platforms to get a recommendation
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── 5 · Quote Builder / Inquiry CTA ─────────────────── */}
        <section aria-label="Inquiry" className="mb-16">
          {hasSelection ? (
            /* Dynamic quote summary */
            <div className="card p-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
              <span className="eyebrow mb-3">Your Custom Quote</span>
              <h2 className="heading-section text-deep mt-2 mb-6">
                Here&rsquo;s what you&rsquo;ve selected
              </h2>

              <div className="space-y-3 mb-6">
                {selPkgObj && (
                  <QuoteRow
                    label={`${TIER_LABEL[selPkgObj.tier] || 'Package'} — ${selPkgObj.name || ''}`}
                    value={selPkgObj.price ? `₹${Number(selPkgObj.price).toLocaleString('en-IN')}` : 'Custom'}
                    onRemove={() => setSelPkgId(null)}
                  />
                )}
                {selAddonObjs.map(a => (
                  <QuoteRow
                    key={a.id}
                    label={`Add-on: ${a.title}`}
                    value={a.price ? `+₹${Number(a.price).toLocaleString('en-IN')}` : null}
                    onRemove={() => toggleAddon(a.id)}
                  />
                ))}
                {selPlatformObjs.length > 0 && (
                  <QuoteRow
                    label={`Platforms: ${selPlatformObjs.map(p => p.name).join(', ')}`}
                    value={null}
                    onRemove={() => setSelPlatformIds(new Set())}
                  />
                )}
              </div>

              {/* Running total */}
              {grandTotal > 0 && (
                <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 mb-6">
                  <span className="text-sm font-bold text-gray-500">Estimated starting at</span>
                  <span className="text-price-val" style={{ color: 'var(--accent)' }}>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Link to={inquiryUrl} className="btn-primary btn-lg">
                  Send Inquiry
                </Link>
                <button onClick={clearAll} className="btn-ghost btn-md text-gray-400">
                  Clear All
                </button>
              </div>
            </div>
          ) : (
            /* Generic CTA */
            <div className="rounded-2xl p-10 text-center"
                 style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
              <h2 className="heading-section mb-2">Interested in {service.title}?</h2>
              <p className="text-body text-gray-500 mb-7 max-w-md mx-auto">
                Build your custom quote using the selector above, or reach out directly and
                we&rsquo;ll discuss the right fit for your business.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to={`/contact?subject=${encodeURIComponent(service.title)}`}
                      className="btn-primary btn-lg">
                  Get a Quote
                </Link>
                <Link to="/services" className="btn-secondary btn-lg">
                  All Services
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ── 6 · Related services ─────────────────────────────── */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className="heading-section text-deep mb-6 flex items-center gap-2">
              <span className="dot-accent" /> More in {service.pillar}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map(s => <ServiceCard key={s.id} service={s} />)}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  Sub-components
// ═════════════════════════════════════════════════════════════════════════════

function SectionHeading({ id, label, children }) {
  return (
    <div className="mb-6">
      <h2 id={id} className="heading-section text-deep flex items-center gap-2">
        <span className="dot-accent" />
        <span dangerouslySetInnerHTML={{ __html: label }} />
      </h2>
      {children && (
        <p className="text-body text-gray-500 mt-1 ml-[1.125rem]">{children}</p>
      )}
    </div>
  )
}

function QuoteRow({ label, value, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-50">
      <span className="text-sm text-gray-700 font-medium flex-1 truncate">{label}</span>
      <div className="flex items-center gap-3 shrink-0">
        {value && (
          <span className="text-sm font-bold text-deep">{value}</span>
        )}
        <button
          onClick={onRemove}
          aria-label="Remove"
          className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <main className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-narrow animate-pulse">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          {[48, 8, 80, 8, 120].map((w, i) => (
            <div key={i} className="h-3 rounded bg-gray-200" style={{ width: w }} />
          ))}
        </div>

        {/* Hero */}
        <div className="card p-8 mb-12">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-8 w-2/3 bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
                <div className="h-3 bg-gray-100 rounded w-4/6" />
              </div>
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-28 bg-gray-200 rounded-xl" />
                <div className="h-10 w-28 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="mb-16">
          <div className="h-5 w-48 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-72 bg-gray-100 rounded mb-6" />
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl border-2 border-gray-200 p-6 bg-white">
                <div className="h-3 w-16 bg-gray-200 rounded mb-4" />
                <div className="h-7 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-100 rounded mb-5" />
                <div className="space-y-2 mb-6">
                  {[1, 2, 3].map(j => <div key={j} className="h-3 bg-gray-100 rounded" />)}
                </div>
                <div className="h-10 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="mb-16">
          <div className="h-5 w-24 bg-gray-200 rounded mb-6" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card p-5">
                <div className="flex justify-between mb-3">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
                <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
                <div className="space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
