import { useEffect, useState } from 'react'
import { supabaseAdmin } from '../lib/supabase'
import AdminLayout from './AdminLayout'

const empty = { title: '', description: '', pillar: '', icon: '', is_active: true }

export default function ManageServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | {edit item}
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabaseAdmin.from('services').select('*').order('pillar')
    setServices(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const openAdd = () => { setForm(empty); setModal('add') }
  const openEdit = item => { setForm(item); setModal(item) }

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    if (modal === 'add') {
      await supabaseAdmin.from('services').insert([form])
    } else {
      await supabaseAdmin.from('services').update(form).eq('id', modal.id)
    }
    await fetch()
    setModal(null)
    setSaving(false)
  }

  const del = async id => {
    if (!confirm('Delete this service?')) return
    await supabaseAdmin.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const toggleActive = async (id, val) => {
    await supabaseAdmin.from('services').update({ is_active: !val }).eq('id', id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !val } : s))
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <button onClick={openAdd} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
            + Add Service
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-xl px-5 py-4 gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl shrink-0">{s.icon || '📌'}</span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{s.title}</p>
                    <p className="text-gray-500 text-xs">{s.pillar}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(s.id, s.is_active)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors ${s.is_active ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'}`}
                  >
                    {s.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-white text-xs px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors">Edit</button>
                  <button onClick={() => del(s.id)} className="text-gray-500 hover:text-red-400 text-xs px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors">Del</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
            <form onSubmit={save} className="bg-[#111827] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-bold">{modal === 'add' ? 'Add Service' : 'Edit Service'}</h3>
              {[
                { name: 'title', label: 'Title', type: 'text', required: true },
                { name: 'pillar', label: 'Pillar / Category', type: 'text' },
                { name: 'icon', label: 'Icon (emoji)', type: 'text' },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={form[f.name] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                    className="w-full bg-[#0A0F1E] border border-gray-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                <textarea rows={3} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-[#0A0F1E] border border-gray-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-300">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-700 text-gray-300 rounded-xl text-sm transition-colors hover:border-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
