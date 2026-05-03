import { useEffect, useState } from 'react'
import { supabaseAdmin } from '../lib/supabase'
import AdminLayout from './AdminLayout'

const emptyGig = { title: '', category: '', short_description: '', cover_image_url: '', is_active: true }
const emptyPkg = { tier: 'starter', price: '', delivery_days: '', milestones: [] }

export default function ManageGigs() {
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyGig)
  const [packages, setPackages] = useState([])
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabaseAdmin.from('gigs').select('*').order('created_at', { ascending: false })
    setGigs(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const openAdd = () => {
    setForm(emptyGig)
    setPackages([{ ...emptyPkg, tier: 'starter' }, { ...emptyPkg, tier: 'standard' }, { ...emptyPkg, tier: 'premium' }])
    setEditing('add')
  }

  const openEdit = async id => {
    const [{ data: gig }, { data: pkgs }] = await Promise.all([
      supabaseAdmin.from('gigs').select('*').eq('id', id).single(),
      supabaseAdmin.from('gig_packages').select('*').eq('gig_id', id),
    ])
    setForm(gig || emptyGig)
    setPackages(pkgs?.length ? pkgs : [
      { ...emptyPkg, tier: 'starter' }, { ...emptyPkg, tier: 'standard' }, { ...emptyPkg, tier: 'premium' },
    ])
    setEditing(id)
  }

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    let gigId = editing === 'add' ? null : editing

    if (editing === 'add') {
      const { data } = await supabaseAdmin.from('gigs').insert([form]).select().single()
      gigId = data?.id
    } else {
      await supabaseAdmin.from('gigs').update(form).eq('id', editing)
    }

    if (gigId) {
      await supabaseAdmin.from('gig_packages').delete().eq('gig_id', gigId)
      const pkgsToInsert = packages
        .filter(p => p.price || p.delivery_days)
        .map(p => ({
          ...p,
          gig_id: gigId,
          price: p.price ? Number(p.price) : null,
          delivery_days: p.delivery_days ? Number(p.delivery_days) : null,
          milestones: typeof p.milestones === 'string' ? p.milestones.split('\n').filter(Boolean) : p.milestones,
        }))
      if (pkgsToInsert.length) await supabaseAdmin.from('gig_packages').insert(pkgsToInsert)
    }

    await fetch()
    setEditing(null)
    setSaving(false)
  }

  const del = async id => {
    if (!confirm('Delete this gig and its packages?')) return
    await supabaseAdmin.from('gig_packages').delete().eq('gig_id', id)
    await supabaseAdmin.from('gigs').delete().eq('id', id)
    setGigs(prev => prev.filter(g => g.id !== id))
  }

  const updatePkg = (tier, field, value) => {
    setPackages(prev => prev.map(p => p.tier === tier ? { ...p, [field]: value } : p))
  }

  if (editing) {
    return (
      <AdminLayout>
        <div className="p-6 sm:p-8 max-w-3xl">
          <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white text-sm mb-6 transition-colors">← Back</button>
          <h1 className="text-2xl font-bold text-white mb-8">{editing === 'add' ? 'New Gig' : 'Edit Gig'}</h1>
          <form onSubmit={save} className="space-y-5">
            {[
              { name: 'title', label: 'Title *', required: true },
              { name: 'category', label: 'Category' },
              { name: 'cover_image_url', label: 'Cover Image URL' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <input type="text" required={f.required} value={form[f.name] || ''} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Short Description</label>
              <textarea rows={2} value={form.short_description || ''} onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))}
                className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
            </div>

            <h3 className="text-white font-semibold pt-2">Packages</h3>
            {['starter', 'standard', 'premium'].map(tier => {
              const pkg = packages.find(p => p.tier === tier) || { ...emptyPkg, tier }
              return (
                <div key={tier} className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3">
                  <h4 className="text-white font-medium capitalize">{tier}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Price (₹)</label>
                      <input type="number" value={pkg.price || ''} onChange={e => updatePkg(tier, 'price', e.target.value)}
                        className="w-full bg-[#0A0F1E] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Delivery (days)</label>
                      <input type="number" value={pkg.delivery_days || ''} onChange={e => updatePkg(tier, 'delivery_days', e.target.value)}
                        className="w-full bg-[#0A0F1E] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Milestones (one per line)</label>
                    <textarea rows={3} value={Array.isArray(pkg.milestones) ? pkg.milestones.join('\n') : pkg.milestones || ''}
                      onChange={e => updatePkg(tier, 'milestones', e.target.value)}
                      className="w-full bg-[#0A0F1E] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
                  </div>
                </div>
              )
            })}

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
              <span className="text-sm text-gray-300">Active</span>
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Gig'}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="px-6 py-2.5 border border-gray-700 text-gray-300 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Gigs</h1>
          <button onClick={openAdd} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">+ New Gig</button>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {gigs.map(g => (
              <div key={g.id} className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-xl px-5 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{g.title}</p>
                  <p className="text-gray-500 text-xs">{g.category}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${g.is_active ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'}`}>{g.is_active ? 'Active' : 'Inactive'}</span>
                  <button onClick={() => openEdit(g.id)} className="text-gray-400 hover:text-white text-xs px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors">Edit</button>
                  <button onClick={() => del(g.id)} className="text-gray-500 hover:text-red-400 text-xs px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors">Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
