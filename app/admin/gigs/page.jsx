'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase as supabaseAdmin } from '@/lib/supabase'

const TIERS = ['starter', 'standard', 'premium']
const TIER_LABELS = { starter: 'Starter', standard: 'Standard', premium: 'Premium' }

const emptyGig = {
  title: '', category: '', short_description: '', cover_image_url: '',
  is_active: true, intro_paragraph: '', explore_more_content: '',
  allowed_platform_ids: [],
}
const emptyPkg     = tier => ({ tier, name: '', price: '', delivery_days: '', features: '', is_featured: false })
const emptyAddon   = { name: '', description: '', price: '', icon: '🧩', max_quantity: 1 }
const emptyPlatform = { name: '', icon: '🌐', category: '' }

const HERO_KEYS = ['gigs_page_eyebrow', 'gigs_page_title', 'gigs_page_subtitle', 'gigs_page_intro']

export default function ManageGigs() {
  const [gigs,            setGigs]            = useState([])
  const [loading,         setLoading]         = useState(true)
  const [editing,         setEditing]         = useState(null)   // null = list, 'add' = new gig, id = edit gig
  const [form,            setForm]            = useState(emptyGig)
  const [packages,        setPackages]        = useState(TIERS.map(emptyPkg))
  const [addons,          setAddons]          = useState([])
  const [addonDraft,      setAddonDraft]      = useState(emptyAddon)
  const [editingAddon,    setEditingAddon]    = useState(null)   // addon id being edited inline
  const [addonEditDraft,  setAddonEditDraft]  = useState(null)   // copy of addon being edited
  const [saving,          setSaving]          = useState(false)
  const [savingAddon,     setSavingAddon]     = useState(false)
  const [allPlatforms,    setAllPlatforms]    = useState([])
  const [showAddPlatform, setShowAddPlatform] = useState(false)
  const [newPlatform,     setNewPlatform]     = useState(emptyPlatform)
  const [savingPlatform,  setSavingPlatform]  = useState(false)

  // Gigs listing page hero settings
  const [hero,        setHero]        = useState({ gigs_page_eyebrow: '', gigs_page_title: '', gigs_page_subtitle: '', gigs_page_intro: '' })
  const [savingHero,  setSavingHero]  = useState(false)
  const [heroSaved,   setHeroSaved]   = useState(false)

  const fetchGigs = async () => {
    const { data } = await supabaseAdmin
      .from('gigs').select('*').order('created_at', { ascending: false })
    setGigs(data || [])
    setLoading(false)
  }

  const fetchPlatforms = useCallback(async () => {
    const { data } = await supabaseAdmin.from('platforms').select('*').order('sort_order')
    setAllPlatforms(data || [])
  }, [])

  const fetchHero = useCallback(async () => {
    const { data } = await supabaseAdmin.from('site_settings').select('key, value').in('key', HERO_KEYS)
    if (data?.length) {
      const map = Object.fromEntries(data.map(r => [r.key, r.value]))
      setHero(prev => ({ ...prev, ...map }))
    }
  }, [])

  useEffect(() => { fetchGigs(); fetchPlatforms(); fetchHero() }, [fetchPlatforms, fetchHero])

  const saveHero = async e => {
    e.preventDefault()
    setSavingHero(true)
    await Promise.all(
      HERO_KEYS.map(key =>
        supabaseAdmin.from('site_settings').upsert({ key, value: hero[key] || '' }, { onConflict: 'key' })
      )
    )
    setSavingHero(false)
    setHeroSaved(true)
    setTimeout(() => setHeroSaved(false), 2500)
  }

  const openAdd = () => {
    setForm(emptyGig)
    setPackages(TIERS.map(emptyPkg))
    setAddons([])
    setAddonDraft(emptyAddon)
    setEditingAddon(null)
    setShowAddPlatform(false)
    setEditing('add')
  }

  const openEdit = async id => {
    const [{ data: gig }, { data: pkgs }, { data: ads }] = await Promise.all([
      supabaseAdmin.from('gigs').select('*').eq('id', id).single(),
      supabaseAdmin.from('gig_packages').select('*').eq('gig_id', id),
      supabaseAdmin.from('gig_addons').select('*').eq('gig_id', id).order('sort_order'),
    ])
    setForm({ ...emptyGig, ...gig, allowed_platform_ids: gig?.allowed_platform_ids || [] })
    const byTier = {}
    ;(pkgs || []).forEach(p => { byTier[p.tier] = p })
    setPackages(TIERS.map(tier => {
      const p = byTier[tier]
      if (!p) return emptyPkg(tier)
      return {
        ...p,
        price:         p.price         ?? '',
        delivery_days: p.delivery_days ?? '',
        features:      Array.isArray(p.features) ? p.features.join('\n') : (p.features || ''),
      }
    }))
    setAddons(ads || [])
    setAddonDraft(emptyAddon)
    setEditingAddon(null)
    setShowAddPlatform(false)
    setEditing(id)
  }

  const togglePlatform = id => {
    setForm(prev => {
      const ids = prev.allowed_platform_ids || []
      return { ...prev, allowed_platform_ids: ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id] }
    })
  }

  const saveGig = async e => {
    e.preventDefault()
    setSaving(true)
    let gigId = editing === 'add' ? null : editing
    const gigPayload = { ...form }
    if (editing === 'add') {
      const { data } = await supabaseAdmin.from('gigs').insert([gigPayload]).select().single()
      gigId = data?.id
    } else {
      await supabaseAdmin.from('gigs').update(gigPayload).eq('id', gigId)
    }
    if (gigId) {
      await supabaseAdmin.from('gig_packages').delete().eq('gig_id', gigId)
      const toInsert = packages
        .filter(p => p.name || p.price !== '')
        .map(p => ({
          gig_id:        gigId,
          tier:          p.tier,
          name:          p.name || TIER_LABELS[p.tier],
          price:         p.price !== '' ? Number(p.price) : null,
          delivery_days: p.delivery_days !== '' ? Number(p.delivery_days) : null,
          features:      typeof p.features === 'string'
            ? p.features.split('\n').map(s => s.trim()).filter(Boolean) : [],
          is_featured: p.is_featured || false,
          is_active:   true,
        }))
      if (toInsert.length) await supabaseAdmin.from('gig_packages').insert(toInsert)
    }
    await fetchGigs()
    if (editing === 'add' && gigId) setEditing(gigId)
    setSaving(false)
  }

  const addAddon = async e => {
    e.preventDefault()
    if (!addonDraft.name || editing === 'add') return
    setSavingAddon(true)
    const { data } = await supabaseAdmin.from('gig_addons').insert([{
      gig_id:       editing,
      name:         addonDraft.name,
      description:  addonDraft.description || null,
      price:        addonDraft.price !== '' ? Number(addonDraft.price) : 0,
      icon:         addonDraft.icon || '🧩',
      max_quantity: addonDraft.max_quantity ? Number(addonDraft.max_quantity) : 1,
      sort_order:   addons.length,
      is_active:    true,
    }]).select().single()
    if (data) setAddons(prev => [...prev, data])
    setAddonDraft(emptyAddon)
    setSavingAddon(false)
  }

  const startEditAddon = addon => {
    setEditingAddon(addon.id)
    setAddonEditDraft({ ...addon, price: String(addon.price ?? ''), max_quantity: String(addon.max_quantity ?? 1) })
  }

  const cancelEditAddon = () => { setEditingAddon(null); setAddonEditDraft(null) }

  const saveEditAddon = async e => {
    e.preventDefault()
    if (!addonEditDraft) return
    setSavingAddon(true)
    const payload = {
      name:         addonEditDraft.name,
      description:  addonEditDraft.description || null,
      price:        addonEditDraft.price !== '' ? Number(addonEditDraft.price) : 0,
      icon:         addonEditDraft.icon || '🧩',
      max_quantity: addonEditDraft.max_quantity ? Number(addonEditDraft.max_quantity) : 1,
    }
    const { data } = await supabaseAdmin.from('gig_addons').update(payload).eq('id', editingAddon).select().single()
    if (data) setAddons(prev => prev.map(a => a.id === editingAddon ? data : a))
    setEditingAddon(null)
    setAddonEditDraft(null)
    setSavingAddon(false)
  }

  const deleteAddon = async id => {
    if (!confirm('Remove this add-on?')) return
    await supabaseAdmin.from('gig_addons').delete().eq('id', id)
    setAddons(prev => prev.filter(a => a.id !== id))
  }

  const addPlatformInline = async e => {
    e.preventDefault()
    if (!newPlatform.name) return
    setSavingPlatform(true)
    const { data } = await supabaseAdmin.from('platforms').insert([{
      name: newPlatform.name, icon: newPlatform.icon || '🌐',
      category: newPlatform.category || null, sort_order: allPlatforms.length, is_active: true,
    }]).select().single()
    if (data) {
      setAllPlatforms(prev => [...prev, data])
      setForm(prev => ({ ...prev, allowed_platform_ids: [...(prev.allowed_platform_ids || []), data.id] }))
    }
    setNewPlatform(emptyPlatform)
    setShowAddPlatform(false)
    setSavingPlatform(false)
  }

  const delGig = async id => {
    if (!confirm('Delete this gig and all its packages / add-ons?')) return
    await supabaseAdmin.from('gig_addons').delete().eq('gig_id', id)
    await supabaseAdmin.from('gig_packages').delete().eq('gig_id', id)
    await supabaseAdmin.from('gigs').delete().eq('id', id)
    setGigs(prev => prev.filter(g => g.id !== id))
  }

  const updatePkg = (tier, field, value) =>
    setPackages(prev => prev.map(p => p.tier === tier ? { ...p, [field]: value } : p))

  // ─── GIG EDITOR ──────────────────────────────────────────────────────────
  if (editing !== null) {
    const isAdd      = editing === 'add'
    const allowedIds = form.allowed_platform_ids || []

    return (
      <div className="p-6 sm:p-8 max-w-5xl">
        <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white text-sm mb-6 transition-colors font-semibold">
          ← Back to Gigs
        </button>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-8">
          {isAdd ? 'New Gig' : 'Edit Gig'}
        </h1>

        <form onSubmit={saveGig} className="space-y-8">
          {/* Gig Info */}
          <div className="admin-card rounded-xl p-6 space-y-4">
            <SectionLabel>Gig Info</SectionLabel>
            <div>
              <label className="admin-label">Title *</label>
              <input type="text" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Paid Ads Management" className="admin-input" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Category</label>
                <input type="text" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Paid Marketing" className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Cover Image URL</label>
                <input type="text" value={form.cover_image_url || ''} onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))} placeholder="https://..." className="admin-input" />
              </div>
            </div>
            <div>
              <label className="admin-label">Short Description</label>
              <textarea rows={2} value={form.short_description || ''} onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))} className="admin-input resize-none" />
            </div>
            <div>
              <label className="admin-label">Intro Paragraph <span className="text-gray-600 font-normal">(shown above packages — embed keywords here)</span></label>
              <textarea rows={3} value={form.intro_paragraph || ''} onChange={e => setForm(p => ({ ...p, intro_paragraph: e.target.value }))} placeholder="Write a keyword-rich intro shown at the top of the gig page before the packages..." className="admin-input resize-none" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
              <span className="text-sm text-gray-300 font-medium">Active (visible on website)</span>
            </label>
          </div>

          {/* Platform Selection */}
          <div className="admin-card rounded-xl p-6">
            <SectionLabel hint="Only selected platforms will show on this gig's page.">Platforms for this Gig</SectionLabel>
            {allPlatforms.length === 0 ? (
              <p className="text-gray-500 text-sm mb-4">No platforms yet. Add one below.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4">
                {allPlatforms.map(p => {
                  const checked = allowedIds.includes(p.id)
                  return (
                    <button key={p.id} type="button" onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${checked ? 'border-accent text-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                      style={checked ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}}>
                      <span>{p.icon || '🌐'}</span><span>{p.name}</span>{checked && <span className="ml-0.5">✓</span>}
                    </button>
                  )
                })}
              </div>
            )}
            {!showAddPlatform ? (
              <button type="button" onClick={() => setShowAddPlatform(true)} className="text-xs text-gray-400 hover:text-white transition-colors font-semibold flex items-center gap-1">
                + Platform not in list? Add it here
              </button>
            ) : (
              <form onSubmit={addPlatformInline} className="bg-white/5 rounded-xl p-4 space-y-3 mt-2">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">New Platform</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="admin-label">Platform Name *</label>
                    <input type="text" required value={newPlatform.name} onChange={e => setNewPlatform(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Google Ads" className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label">Icon (emoji)</label>
                    <input type="text" value={newPlatform.icon} onChange={e => setNewPlatform(p => ({ ...p, icon: e.target.value }))} placeholder="🌐" className="admin-input" />
                  </div>
                </div>
                <div>
                  <label className="admin-label">Category (optional)</label>
                  <input type="text" value={newPlatform.category} onChange={e => setNewPlatform(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Search, Social" className="admin-input" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={savingPlatform || !newPlatform.name} className="btn-admin btn-sm disabled:opacity-60">
                    {savingPlatform ? 'Adding…' : '+ Add & Select'}
                  </button>
                  <button type="button" onClick={() => { setShowAddPlatform(false); setNewPlatform(emptyPlatform) }} className="text-xs text-gray-500 hover:text-white px-3 py-1 rounded-lg transition-colors">Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Packages */}
          <div>
            <SectionLabel hint="Price = per platform per month. User selects platforms → price multiplies.">Packages</SectionLabel>
            <div className="grid sm:grid-cols-3 gap-4">
              {TIERS.map(tier => {
                const pkg = packages.find(p => p.tier === tier) || emptyPkg(tier)
                return (
                  <div key={tier} className="admin-card rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold">{TIER_LABELS[tier]}</h3>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-400 select-none">
                        <input type="checkbox" checked={pkg.is_featured} onChange={e => updatePkg(tier, 'is_featured', e.target.checked)} />
                        Most Popular
                      </label>
                    </div>
                    <div>
                      <label className="admin-label">Package Name</label>
                      <input type="text" value={pkg.name} onChange={e => updatePkg(tier, 'name', e.target.value)} placeholder={tier === 'starter' ? 'Basic' : tier === 'standard' ? 'Growth' : 'Full-Service'} className="admin-input text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="admin-label">Price / Platform ($)</label>
                        <input type="number" value={pkg.price} min="0" onChange={e => updatePkg(tier, 'price', e.target.value)} placeholder="150" className="admin-input text-sm" />
                      </div>
                      <div>
                        <label className="admin-label">Setup (days)</label>
                        <input type="number" value={pkg.delivery_days} min="1" onChange={e => updatePkg(tier, 'delivery_days', e.target.value)} placeholder="3" className="admin-input text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="admin-label">Features (one per line)</label>
                      <textarea rows={7} value={pkg.features} onChange={e => updatePkg(tier, 'features', e.target.value)} placeholder={`1 Campaign\n3 Ad Groups\nBasic Research\nConversion Tracking\nMonthly Report`} className="admin-input resize-none text-xs font-mono" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-admin btn-md disabled:opacity-60">
            {saving ? 'Saving…' : isAdd ? 'Create Gig' : 'Save Changes'}
          </button>
        </form>

        {/* Add-Ons with inline edit */}
        <div className="mt-12 border-t pt-10" style={{ borderColor: 'var(--admin-border)' }}>
          <SectionLabel hint="Users can optionally select these with a quantity multiplier when inquiring.">Add-Ons {!isAdd && `(${addons.length})`}</SectionLabel>
          {isAdd ? (
            <p className="text-gray-500 text-sm bg-white/5 rounded-xl px-5 py-4">💡 Save the gig first, then add your add-on services here.</p>
          ) : (
            <>
              {addons.length > 0 && (
                <div className="space-y-2 mb-6">
                  {addons.map(a => {
                    const isEditing = editingAddon === a.id
                    if (isEditing && addonEditDraft) {
                      return (
                        <form key={a.id} onSubmit={saveEditAddon} className="admin-card rounded-xl p-5 border" style={{ borderColor: 'var(--accent)' }}>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Editing Add-On</p>
                          <div className="grid sm:grid-cols-4 gap-3 mb-3">
                            <div className="sm:col-span-2">
                              <label className="admin-label">Name *</label>
                              <input type="text" required value={addonEditDraft.name} onChange={e => setAddonEditDraft(p => ({ ...p, name: e.target.value }))} className="admin-input" />
                            </div>
                            <div>
                              <label className="admin-label">Price ($)</label>
                              <input type="number" min="0" value={addonEditDraft.price} onChange={e => setAddonEditDraft(p => ({ ...p, price: e.target.value }))} className="admin-input" />
                            </div>
                            <div>
                              <label className="admin-label">Icon</label>
                              <input type="text" value={addonEditDraft.icon} onChange={e => setAddonEditDraft(p => ({ ...p, icon: e.target.value }))} className="admin-input" />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-4 gap-3 mb-4">
                            <div className="sm:col-span-3">
                              <label className="admin-label">Description</label>
                              <input type="text" value={addonEditDraft.description || ''} onChange={e => setAddonEditDraft(p => ({ ...p, description: e.target.value }))} className="admin-input" />
                            </div>
                            <div>
                              <label className="admin-label">Max Qty</label>
                              <input type="number" min="1" max="30" value={addonEditDraft.max_quantity} onChange={e => setAddonEditDraft(p => ({ ...p, max_quantity: e.target.value }))} className="admin-input" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" disabled={savingAddon} className="btn-admin btn-sm disabled:opacity-60">
                              {savingAddon ? 'Saving…' : 'Save'}
                            </button>
                            <button type="button" onClick={cancelEditAddon} className="text-xs text-gray-500 hover:text-white px-3 py-1 rounded-lg transition-colors">Cancel</button>
                          </div>
                        </form>
                      )
                    }
                    return (
                      <div key={a.id} className="admin-card rounded-xl px-5 py-3.5 flex items-center gap-4">
                        <span className="text-xl shrink-0">{a.icon || '🧩'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold">{a.name}</p>
                          {a.description && <p className="text-gray-500 text-xs truncate">{a.description}</p>}
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">Max qty: {a.max_quantity || 1}</span>
                        <span className="text-sm font-bold shrink-0" style={{ color: 'var(--accent)' }}>
                          {a.price > 0 ? `$${Number(a.price).toLocaleString()}` : 'Free'}
                        </span>
                        <button type="button" onClick={() => startEditAddon(a)} className="text-gray-400 hover:text-white text-xs px-3 py-1 rounded-lg hover:bg-white/5 transition-colors shrink-0">Edit</button>
                        <button type="button" onClick={() => deleteAddon(a.id)} className="text-gray-500 hover:text-red-400 text-xs px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors shrink-0">Remove</button>
                      </div>
                    )
                  })}
                </div>
              )}
              <form onSubmit={addAddon} className="admin-card rounded-xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4">Add New Add-On</p>
                <div className="grid sm:grid-cols-4 gap-3 mb-3">
                  <div className="sm:col-span-2">
                    <label className="admin-label">Name *</label>
                    <input type="text" required value={addonDraft.name} onChange={e => setAddonDraft(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Extra Campaign Setup" className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label">Price ($)</label>
                    <input type="number" value={addonDraft.price} min="0" onChange={e => setAddonDraft(p => ({ ...p, price: e.target.value }))} placeholder="50" className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label">Icon</label>
                    <input type="text" value={addonDraft.icon} onChange={e => setAddonDraft(p => ({ ...p, icon: e.target.value }))} placeholder="🧩" className="admin-input" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-4 gap-3 mb-4">
                  <div className="sm:col-span-3">
                    <label className="admin-label">Description</label>
                    <input type="text" value={addonDraft.description} onChange={e => setAddonDraft(p => ({ ...p, description: e.target.value }))} placeholder="Short description of what this includes" className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label">Max Quantity</label>
                    <input type="number" value={addonDraft.max_quantity} min="1" max="30" onChange={e => setAddonDraft(p => ({ ...p, max_quantity: e.target.value }))} placeholder="1" className="admin-input" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4">Max Qty &gt; 1 lets users pick e.g. "3 extra days delivery" — price × qty.</p>
                <button type="submit" disabled={savingAddon || !addonDraft.name} className="btn-admin btn-sm disabled:opacity-60">
                  {savingAddon ? 'Adding…' : '+ Add Add-On'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Explore More Content */}
        <div className="mt-12 border-t pt-10" style={{ borderColor: 'var(--admin-border)' }}>
          <SectionLabel hint="Shown below the inquiry form. Users click 'Explore More' to scroll here.">Explore More Section</SectionLabel>
          <div className="admin-card rounded-xl p-5">
            <textarea
              rows={8}
              value={form.explore_more_content || ''}
              onChange={e => setForm(p => ({ ...p, explore_more_content: e.target.value }))}
              placeholder="Add detailed information about this service — FAQs, process explanation, case studies, why choose us, etc."
              className="admin-input resize-y w-full"
            />
            <p className="text-xs text-gray-600 mt-2">Save the gig (button above) to persist changes here too.</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── GIGS LIST ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Gigs</h1>
          <p className="text-gray-400 text-sm mt-1">{gigs.length} total</p>
        </div>
        <button onClick={openAdd} className="btn-admin btn-sm">+ New Gig</button>
      </div>

      {/* ── Gigs Listing Page Hero Editor ── */}
      <form onSubmit={saveHero} className="admin-card rounded-xl p-6 mb-10 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <SectionLabel hint="Edits the top hero section on the public /gigs listing page.">Gigs Page — Top Section</SectionLabel>
          {heroSaved && <span className="text-xs text-green-400 font-semibold">Saved ✓</span>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Eyebrow Label</label>
            <input type="text" value={hero.gigs_page_eyebrow} onChange={e => setHero(p => ({ ...p, gigs_page_eyebrow: e.target.value }))} placeholder="e.g. Freelance Gigs" className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Heading Title</label>
            <input type="text" value={hero.gigs_page_title} onChange={e => setHero(p => ({ ...p, gigs_page_title: e.target.value }))} placeholder="e.g. Packaged Services" className="admin-input" />
          </div>
        </div>
        <div>
          <label className="admin-label">Subtitle / Tagline</label>
          <input type="text" value={hero.gigs_page_subtitle} onChange={e => setHero(p => ({ ...p, gigs_page_subtitle: e.target.value }))} placeholder="Short line below the heading..." className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Intro Paragraph <span className="text-gray-600 font-normal">(keyword-rich, shown below subtitle with accent border)</span></label>
          <textarea rows={3} value={hero.gigs_page_intro} onChange={e => setHero(p => ({ ...p, gigs_page_intro: e.target.value }))} placeholder="Optional longer intro paragraph — great for embedding keywords..." className="admin-input resize-none" />
        </div>
        <button type="submit" disabled={savingHero} className="btn-admin btn-sm disabled:opacity-60">
          {savingHero ? 'Saving…' : 'Save Page Section'}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-sm">
          <p className="text-4xl mb-3">📦</p>
          <p>No gigs yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {gigs.map(g => (
            <div key={g.id} className="flex items-center justify-between admin-card rounded-xl px-5 py-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{g.title}</p>
                <p className="text-gray-500 text-xs">{g.category || 'No category'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full ${g.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                  {g.is_active ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => openEdit(g.id)} className="text-gray-400 hover:text-white text-xs px-3 py-1 rounded-lg hover:bg-white/5 transition-colors">Edit</button>
                <button onClick={() => delGig(g.id)} className="text-gray-500 hover:text-red-400 text-xs px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors">Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children, hint }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">{children}</p>
      {hint && <p className="text-xs text-gray-600 mt-0.5">{hint}</p>}
    </div>
  )
}
