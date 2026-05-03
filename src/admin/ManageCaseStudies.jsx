import { useEffect, useState } from 'react'
import { supabaseAdmin } from '../lib/supabase'
import AdminLayout from './AdminLayout'

const empty = { title: '', client_name: '', industry: '', challenge: '', strategy: '', execution: '', results: '', key_metrics: {}, cover_image_url: '', is_featured: false, is_published: false }

export default function ManageCaseStudies() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [metricsRaw, setMetricsRaw] = useState('')
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabaseAdmin.from('case_studies').select('id, title, client_name, industry, is_published, is_featured').order('created_at', { ascending: false })
    setCases(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

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
    await fetch()
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
      <AdminLayout>
        <div className="p-6 sm:p-8 max-w-3xl">
          <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">← Back</button>
          <h1 className="text-2xl font-bold text-white mb-8">{editing === 'add' ? 'New Case Study' : 'Edit Case Study'}</h1>
          <form onSubmit={save} className="space-y-5">
            {[
              { name: 'title', label: 'Title *', required: true },
              { name: 'client_name', label: 'Client Name' },
              { name: 'industry', label: 'Industry' },
              { name: 'cover_image_url', label: 'Cover Image URL' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <input type="text" required={f.required} value={form[f.name] || ''} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            {[
              { name: 'challenge', label: 'Challenge' },
              { name: 'strategy', label: 'Strategy' },
              { name: 'execution', label: 'Execution' },
              { name: 'results', label: 'Results' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <textarea rows={4} value={form[f.name] || ''} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-y" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Key Metrics (JSON e.g. {`{"ROAS": "10x", "Leads": "40/wk"}`})</label>
              <textarea rows={4} value={metricsRaw} onChange={e => setMetricsRaw(e.target.value)}
                className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none font-mono" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} />
                <span className="text-sm text-gray-300">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} />
                <span className="text-sm text-gray-300">Featured on Home</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
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
          <h1 className="text-2xl font-bold text-white">Case Studies</h1>
          <button onClick={openAdd} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">+ Add</button>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {cases.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-xl px-5 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{c.title}</p>
                  <p className="text-gray-500 text-xs">{c.client_name} · {c.industry}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleField(c.id, 'is_featured', c.is_featured)} className={`text-xs px-2.5 py-1 rounded-full transition-colors ${c.is_featured ? 'bg-yellow-500/10 text-yellow-400' : 'bg-gray-800 text-gray-600'}`}>★</button>
                  <button onClick={() => toggleField(c.id, 'is_published', c.is_published)} className={`text-xs px-2.5 py-1 rounded-full transition-colors ${c.is_published ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'}`}>{c.is_published ? 'Published' : 'Draft'}</button>
                  <button onClick={() => openEdit(c.id)} className="text-gray-400 hover:text-white text-xs px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors">Edit</button>
                  <button onClick={() => del(c.id)} className="text-gray-500 hover:text-red-400 text-xs px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors">Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
