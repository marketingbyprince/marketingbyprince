import { useEffect, useState } from 'react'
import { supabaseAdmin } from '../lib/supabase'
import AdminLayout from './AdminLayout'

const empty = { name: '', issuer: '', issue_date: '', credential_url: '', badge_image_url: '', is_active: true }

export default function ManageCertifications() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabaseAdmin.from('certifications').select('*').order('issue_date', { ascending: false })
    setCerts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const openAdd = () => { setForm(empty); setModal('add') }
  const openEdit = item => { setForm(item); setModal(item) }

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    if (modal === 'add') {
      await supabaseAdmin.from('certifications').insert([form])
    } else {
      await supabaseAdmin.from('certifications').update(form).eq('id', modal.id)
    }
    await fetch()
    setModal(null)
    setSaving(false)
  }

  const del = async id => {
    if (!confirm('Delete this certification?')) return
    await supabaseAdmin.from('certifications').delete().eq('id', id)
    setCerts(prev => prev.filter(c => c.id !== id))
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Certifications</h1>
          <button onClick={openAdd} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">+ Add</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {certs.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-xl px-5 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{c.name}</p>
                  <p className="text-gray-500 text-xs">{c.issuer} · {c.issue_date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-white text-xs px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors">Edit</button>
                  <button onClick={() => del(c.id)} className="text-gray-500 hover:text-red-400 text-xs px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors">Del</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
            <form onSubmit={save} className="bg-[#111827] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-bold">{modal === 'add' ? 'Add Certification' : 'Edit Certification'}</h3>
              {[
                { name: 'name', label: 'Certificate Name *', required: true },
                { name: 'issuer', label: 'Issuer' },
                { name: 'issue_date', label: 'Issue Date', type: 'date' },
                { name: 'credential_url', label: 'Credential URL', type: 'url' },
                { name: 'badge_image_url', label: 'Badge Image URL', type: 'url' },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                  <input type={f.type || 'text'} required={f.required} value={form[f.name] || ''} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                    className="w-full bg-[#0A0F1E] border border-gray-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <span className="text-sm text-gray-300">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-700 text-gray-300 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
