import { useEffect, useState } from 'react'
import { supabase as supabaseAdmin } from '../lib/supabase'
import AdminLayout from './AdminLayout'

const TIERS = ['starter', 'standard', 'premium']
const TIER_LABELS = { starter: 'Starter', standard: 'Standard', premium: 'Premium' }

const emptyGig = { title: '', category: '', short_description: '', cover_image_url: '', is_active: true }
const emptyPkg = tier => ({ tier, name: '', price: '', delivery_days: '', features: '', is_featured: false })
const emptyAddon = { name: '', description: '', price: '', icon: '🧩' }

export default function ManageGigs() {
  const [gigs,        setGigs]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [editing,     setEditing]     = useState(null)
  const [form,        setForm]        = useState(emptyGig)
  const [packages,    setPackages]    = useState(TIERS.map(emptyPkg))
  const [addons,      setAddons]      = useState([])
  const [addonDraft,  setAddonDraft]  = useState(emptyAddon)
  const [saving,      setSaving]      = useState(false)
  const [savingAddon, setSavingAddon] = useState(false)

  const fetchGigs = async () => {
    const { data } = await supabaseAdmin
      .from('gigs').select('*').order('created_at', { ascending: false })
    setGigs(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchGigs() }, [])

  const openAdd = () => {
    setForm(emptyGig)
    setPackages(TIERS.map(emptyPkg))
    setAddons([])
    setAddonDraft(emptyAddon)
    setEditing('add')
  }

  const openEdit = async id => {
    const [{ data: gig }, { data: pkgs }, { data: ads }] = await Promise.all([
      supabaseAdmin.from('gigs').select('*').eq('id', id).single(),
      supabaseAdmin.from('gig_packages').select('*').eq('gig_id', id),
      supabaseAdmin.from('gig_addons').select('*').eq('gig_id', id).order('sort_order'),
    ])
    setForm(gig || emptyGig)
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
    setEditing(id)
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
            ? p.features.split('\n').map(s => s.trim()).filter(Boolean)
            : [],
          is_featured: p.is_featured || false,
          is_active:   true,
        }))
      if (toInsert.length) await supabaseAdmin.from('gig_packages').insert(toInsert)
    }

    await fetchGigs()
    if (editing === 'add' && gigId) setEditing(gigId)
    else setSaving(false)
    setSaving(false)
  }

  const addAddon = async e => {
    e.preventDefault()
    if (!addonDraft.name || editing === 'add') return
    setSavingAddon(true)
    const { data } = await supabaseAdmin.from('gig_addons').insert([{
      gig_id:      editing,
      name:        addonDraft.name,
      description: addonDraft.description || null,
      price:       addonDraft.price !== '' ? Number(addonDraft.price) : 0,
      icon:        addonDraft.icon || '🧩',
      sort_order:  addons.length,
      is_active:   true,
    }]).select().single()
    if (data) setAddons(prev => [...prev, data])
    setAddonDraft(emptyAddon)
    setSavingAddon(false)
  }

  const deleteAddon = async id => {
    if (!confirm('Remove this add-on?')) return
    await supabaseAdmin.from('gig_addons').delete().eq('id', id)
    setAddons(prev => prev.filter(a => a.id !== id))
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

  if (editing !== null) {
    const isAdd = editing === 'add'
    return (
      <AdminLayout>
        <div className="p-6 sm:p-8 max-w-5xl">
          <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white text-sm mb-6 transition-colors font-semibold">
            ← Back to Gigs
          </button>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-8">
            {isAdd ? 'New Gig' : 'Edit Gig'}
          </h1>
          <form onSubmit={saveGig} className="space-y-8">
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <span className="text-sm text-gray-300 font-medium">Active (visible on website)</span>
              </label>
            </div>
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
          <div className="mt-12 border-t pt-10" style={{ borderColor: 'var(--admin-border)' }}>
            <SectionLabel hint="Users can optionally select these when inquiring.">Add-Ons {!isAdd && `(${addons.length})`}</SectionLabel>
            {isAdd ? (
              <p className="text-gray-500 text-sm bg-white/5 rounded-xl px-5 py-4">💡 Save the gig first, then add your add-on services here.</p>
            ) : (
              <>
                {addons.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {addons.map(a => (
                      <div key={a.id} className="admin-card rounded-xl px-5 py-3.5 flex items-center gap-4">
                        <span className="text-xl shrink-0">{a.icon || '🧩'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold">{a.name}</p>
                          {a.description && <p className="text-gray-500 text-xs truncate">{a.description}</p>}
                        </div>
                        <span className="text-sm font-bold shrink-0" style={{ color: 'var(--accent)' }}>
                          {a.price > 0 ? `$${Number(a.price).toLocaleString()}` : 'Free'}
                        </span>
                        <button onClick={() => deleteAddon(a.id)} className="text-gray-500 hover:text-red-400 text-xs px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors shrink-0">Remove</button>
                      </div>
                    ))}
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
                  <div className="mb-4">
                    <label className="admin-label">Description</label>
                    <input type="text" value={addonDraft.description} onChange={e => setAddonDraft(p => ({ ...p, description: e.target.value }))} placeholder="Short description of what this includes" className="admin-input" />
                  </div>
                  <button type="submit" disabled={savingAddon || !addonDraft.name} className="btn-admin btn-sm disabled:opacity-60">
                    {savingAddon ? 'Adding…' : '+ Add Add-On'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Gigs</h1>
            <p className="text-gray-400 text-sm mt-1">{gigs.length} total</p>
          </div>
          <button onClick={openAdd} className="btn-admin btn-sm">+ New Gig</button>
        </div>
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
    </AdminLayout>
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
