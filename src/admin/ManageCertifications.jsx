import { useEffect, useState } from 'react'
import { supabaseAdmin } from '../lib/supabase'
import AdminLayout from './AdminLayout'

const empty = {
  name: '', issuer: '', issue_date: '', credential_url: '', badge_image_url: '', is_active: true,
}

export default function ManageCertifications() {
  const [certs,   setCerts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState(empty)
  const [saving,  setSaving]  = useState(false)

  const fetchData = async () => {
    const { data } = await supabaseAdmin.from('certifications').select('*')
      .order('issue_date', { ascending: false })
    setCerts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openAdd  = () => { setForm(empty); setModal('add') }
  const openEdit = item => { setForm(item); setModal(item) }

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    if (modal === 'add') {
      await supabaseAdmin.from('certifications').insert([form])
    } else {
      await supabaseAdmin.from('certifications').update(form).eq('id', modal.id)
    }
    await fetchData()
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Certifications</h1>
          <button onClick={openAdd} className="btn-admin btn-sm">+ Add</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : (
          <div className="space-y-2">
            {certs.map(c => (
              <div key={c.id}
                   className="flex items-center justify-between admin-card rounded-xl px-5 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-gray-500 text-xs">{c.issuer} &middot; {c.issue_date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(c)}
                          className="text-gray-400 hover:text-white text-xs px-3 py-1 rounded-lg hover:bg-white/5 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => del(c.id)}
                          className="text-gray-500 hover:text-red-400 text-xs px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
               onClick={() => setModal(null)}>
            <form onSubmit={save}
                  className="admin-card rounded-2xl p-6 w-full max-w-md space-y-4"
                  onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-extrabold tracking-tight">
                {modal === 'add' ? 'Add Certification' : 'Edit Certification'}
              </h3>
              {[
                { name: 'name',            label: 'Certificate Name *', required: true,  type: 'text' },
                { name: 'issuer',          label: 'Issuer',                               type: 'text' },
                { name: 'issue_date',      label: 'Issue Date',                           type: 'date' },
                { name: 'credential_url',  label: 'Credential URL',                       type: 'url'  },
                { name: 'badge_image_url', label: 'Badge Image URL',                      type: 'url'  },
              ].map(f => (
                <div key={f.name}>
                  <label className="admin-label">{f.label}</label>
                  <input type={f.type} required={f.required}
                         value={form[f.name] || ''}
                         onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                         className="admin-input" />
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active}
                       onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <span className="text-sm text-gray-300 font-medium">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                        className="flex-1 btn-admin btn-md disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setModal(null)}
                        className="flex-1 btn btn-md border border-gray-700 text-gray-300">
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
