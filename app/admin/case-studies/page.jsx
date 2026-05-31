'use client'
import { useEffect, useState } from 'react'
import { supabase as supabaseAdmin } from '@/lib/supabase'

const empty = {
  title: '', client_name: '', industry: '', challenge: '', strategy: '',
  execution: '', results: '', key_metrics: {}, cover_image_url: '',
  is_featured: false, is_published: false,
}

export default function ManageCaseStudies() {
  const [cases,      setCases]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(empty)
  const [metricsRaw, setMetricsRaw] = useState('')
  const [saving,     setSaving]     = useState(false)

  const fetchData = async () => {
    const { data } = await supabaseAdmin.from('case_studies')
      .select('id, title, client_name, industry, is_published, is_featured')
      .order('created_at', { ascending: false })
    setCases(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openAdd = () => { setForm(empty); setMetricsRaw(''); setEditing('add') }
  const openEdit = async id => {
    const { data } = await supabaseAdmin.from('case_studies').select('*').eq('id', id).single()
    setForm(data || empty)
    setMetricsRaw(JSON.stringify(data?.key_metrics || {}, null, 2))
    setEditing(id)
  }

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    let key_metrics = {}
    try { key_metrics = JSON.parse(metricsRaw || '{}') } catch (_) {}
    const payload = { ...form, key_metrics }
    if (editing === 'add') {
      await supabaseAdmin.from('case_studies').insert([payload])
    } else {
      await supabaseAdmin.from('case_studies').update(payload).eq('id', editing)
    }
    await fetchData()
    setEditing(null)
    setSaving(false)
  }

  const del = async id => {
    if (!confirm('Delete this case study?')) return
    await supabaseAdmin.from('case_studies').delete().eq('id', id)
    setCases(prev => prev.filter(c => c.id !== id))
  }

  const toggleField = async (id, field, val) => {
    await supabaseAdmin.from('case_studies').update({ [field]: !val }).eq('id', id)
    setCases(prev => prev.map(c => c.id === id ? { ...c, [field]: !val } : c))
  }

  if (editing) {
    return (
      <div className="p-6 sm:p-8 max-w-3xl">
        <button onClick={() => setEditing(null)}
                className="text-gray-500 hover:text-white text-sm mb-6 transition-colors font-semibold">
          &larr; Back
        </button>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-8">
          {editing === 'add' ? 'New Case Study' : 'Edit Case Study'}
        </h1>
        <form onSubmit={save} className="space-y-5">
          {[
            { name: 'title',           label: 'Title *',         required: true },
            { name: 'client_name',     label: 'Client Name' },
            { name: 'industry',        label: 'Industry' },
            { name: 'cover_image_url', label: 'Cover Image URL' },
          ].map(f => (
            <div key={f.name}>
              <label className="admin-label">{f.label}</label>
              <input type="text" required={f.required}
                     value={form[f.name] || ''}
                     onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                     className="admin-input" />
            </div>
          ))}
          {[
            { name: 'challenge', label: 'Challenge' },
            { name: 'strategy',  label: 'Strategy' },
            { name: 'execution', label: 'Execution' },
            { name: 'results',   label: 'Results' },
          ].map(f => (
            <div key={f.name}>
              <label className="admin-label">{f.label}</label>
              <textarea rows={4} value={form[f.name] || ''}
                        onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                        className="admin-input resize-y" />
            </div>
          ))}
          <div>
            <label className="admin-label">Key Metrics (JSON)</label>
            <textarea rows={4} value={metricsRaw}
                      onChange={e => setMetricsRaw(e.target.value)}
                      placeholder={'{"ROAS": "10x", "Leads": "40/wk"}'}
                      className="admin-input resize-none font-mono text-xs" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_published}
                     onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} />
              <span className="text-sm text-gray-300 font-medium">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured}
                     onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} />
              <span className="text-sm text-gray-300 font-medium">Featured on Home</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
                    className="btn-admin btn-md disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(null)}
                    className="btn btn-md border border-gray-700 text-gray-300">
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Case Studies</h1>
        <button onClick={openAdd} className="btn-admin btn-sm">+ Add</button>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="space-y-2">
          {cases.map(c => (
            <div key={c.id}
                 className="flex items-center justify-between admin-card rounded-xl px-5 py-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{c.title}</p>
                <p className="text-gray-500 text-xs">{c.client_name} &middot; {c.industry}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleField(c.id, 'is_featured', c.is_featured)}
                        className={`text-xs px-2.5 py-1 rounded-full transition-colors ${c.is_featured ? 'bg-yellow-500/10 text-yellow-400' : 'bg-white/5 text-gray-600'}`}>
                  &#9733;
                </button>
                <button onClick={() => toggleField(c.id, 'is_published', c.is_published)}
                        className={`text-xs px-2.5 py-1 rounded-full transition-colors ${c.is_published ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                  {c.is_published ? 'Published' : 'Draft'}
                </button>
                <button onClick={() => openEdit(c.id)}
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
    </div>
  )
}
