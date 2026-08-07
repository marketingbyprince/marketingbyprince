'use client'
import { useEffect, useState } from 'react'
import { supabase as supabaseAdmin } from '@/lib/supabase'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { CASE_STUDY_CHANNELS } from '@/lib/caseStudyChannels'

const slugify = s => (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const empty = {
  title: '', client_name: '', industry: '', channel: '', slug: '', summary: '', duration: '',
  challenge: '', objective: '', strategy: '', execution: '', results: '',
  key_metrics: {}, metrics_table: null, screenshots: [],
  cover_image_url: '', pdf_url: '', portfolio_url: '',
  is_featured: false, is_published: false,
}

export default function ManageCaseStudies() {
  const [cases,        setCases]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [editing,      setEditing]      = useState(null)
  const [form,         setForm]         = useState(empty)
  const [slugTouched,  setSlugTouched]  = useState(false)
  const [metricsRaw,   setMetricsRaw]   = useState('')
  const [tableRaw,     setTableRaw]     = useState('')
  const [shotsRaw,     setShotsRaw]     = useState('')
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')

  const fetchData = async () => {
    const { data } = await supabaseAdmin.from('case_studies')
      .select('id, title, client_name, industry, channel, is_published, is_featured')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    setCases(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openAdd = () => {
    setForm(empty); setSlugTouched(false)
    setMetricsRaw(''); setTableRaw(''); setShotsRaw('[]')
    setError(''); setEditing('add')
  }
  const openEdit = async id => {
    const { data } = await supabaseAdmin.from('case_studies').select('*').eq('id', id).single()
    setForm(data || empty)
    setSlugTouched(true)
    setMetricsRaw(JSON.stringify(data?.key_metrics || {}, null, 2))
    setTableRaw(data?.metrics_table ? JSON.stringify(data.metrics_table, null, 2) : '')
    setShotsRaw(JSON.stringify(data?.screenshots || [], null, 2))
    setError(''); setEditing(id)
  }

  const onTitleChange = val => {
    setForm(p => ({ ...p, title: val, slug: slugTouched ? p.slug : slugify(val) }))
  }

  const save = async e => {
    e.preventDefault()
    setError('')

    let key_metrics = {}
    try { key_metrics = JSON.parse(metricsRaw || '{}') } catch { setError('"Key Metrics" isn\'t valid JSON.'); return }

    let metrics_table = null
    if (tableRaw.trim()) {
      try { metrics_table = JSON.parse(tableRaw) } catch { setError('"Metrics Table" isn\'t valid JSON.'); return }
    }

    let screenshots = []
    if (shotsRaw.trim()) {
      try { screenshots = JSON.parse(shotsRaw) } catch { setError('"Screenshots" isn\'t valid JSON.'); return }
    }

    setSaving(true)
    const payload = { ...form, slug: slugify(form.slug) || null, key_metrics, metrics_table, screenshots }
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
          <div>
            <label className="admin-label">Title *</label>
            <input type="text" required value={form.title}
                   onChange={e => onTitleChange(e.target.value)}
                   className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Slug *</label>
            <input type="text" required value={form.slug}
                   onChange={e => { setSlugTouched(true); setForm(p => ({ ...p, slug: e.target.value })) }}
                   className="admin-input font-mono text-sm" />
            <p className="text-xs mt-1 text-gray-500">Public URL: /case-studies/{slugify(form.slug) || '…'}</p>
          </div>

          {[
            { name: 'client_name', label: 'Client Name' },
            { name: 'industry',    label: 'Industry' },
          ].map(f => (
            <div key={f.name}>
              <label className="admin-label">{f.label}</label>
              <input type="text" value={form[f.name] || ''}
                     onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                     className="admin-input" />
            </div>
          ))}

          <div>
            <label className="admin-label">Channel</label>
            <input type="text" list="channel-options" value={form.channel || ''}
                   onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}
                   placeholder="e.g. Meta Ads" className="admin-input" />
            <datalist id="channel-options">
              {CASE_STUDY_CHANNELS.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label className="admin-label">Summary</label>
            <textarea rows={2} value={form.summary || ''}
                      onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                      placeholder="One or two sentences — used on cards, the hero, and as the meta description."
                      className="admin-input resize-none" />
          </div>

          <div>
            <label className="admin-label">Duration / Reporting Period</label>
            <input type="text" value={form.duration || ''}
                   onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                   placeholder="e.g. 13–24 Jul 2026" className="admin-input" />
          </div>

          {[
            { name: 'cover_image_url', label: 'Cover Image URL', hint: 'Upload in Media Manager, then paste the public URL here.' },
            { name: 'pdf_url',         label: 'Full Case Study PDF URL', hint: 'Upload the PDF in Media Manager, then paste the public URL here.' },
            { name: 'portfolio_url',   label: 'Live Portfolio URL', hint: 'Optional — shown as "View Live" on the Portfolio page' },
          ].map(f => (
            <div key={f.name}>
              <label className="admin-label">{f.label}</label>
              <input type="text"
                     value={form[f.name] || ''}
                     onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                     className="admin-input" />
              {f.hint && <p className="text-xs mt-1 text-gray-500">{f.hint}</p>}
            </div>
          ))}

          {[
            { name: 'challenge', label: 'Challenge' },
            { name: 'objective', label: 'Objective' },
            { name: 'strategy',  label: 'Strategy' },
            { name: 'execution', label: 'Execution' },
            { name: 'results',   label: 'Results' },
          ].map(f => (
            <div key={f.name}>
              <label className="admin-label">{f.label}</label>
              <RichTextEditor
                value={form[f.name] || ''}
                onChange={val => setForm(p => ({ ...p, [f.name]: val }))}
                placeholder={`Write the ${f.label.toLowerCase()} section…`}
                minHeight={180}
              />
            </div>
          ))}

          <div>
            <label className="admin-label">Key Metrics (JSON)</label>
            <textarea rows={4} value={metricsRaw}
                      onChange={e => setMetricsRaw(e.target.value)}
                      placeholder={'{"ROAS": "10x", "Leads": "40/wk"}'}
                      className="admin-input resize-none font-mono text-xs" />
            <p className="text-xs mt-1 text-gray-500">Top-line numbers shown on cards and the results grid.</p>
          </div>

          <div>
            <label className="admin-label">Metrics Table (JSON, optional)</label>
            <textarea rows={5} value={tableRaw}
                      onChange={e => setTableRaw(e.target.value)}
                      placeholder={'{"columns":["Metric","Week 1","Week 2"],"rows":[["Spend","$100","$80"]],"highlightLastCol":false}'}
                      className="admin-input resize-none font-mono text-xs" />
            <p className="text-xs mt-1 text-gray-500">Only add this when there's a real period-over-period comparison to show.</p>
          </div>

          <div>
            <label className="admin-label">Screenshots (JSON array)</label>
            <textarea rows={4} value={shotsRaw}
                      onChange={e => setShotsRaw(e.target.value)}
                      placeholder={'[{"url":"https://...","caption":"Ad performance dashboard"}]'}
                      className="admin-input resize-none font-mono text-xs" />
            <p className="text-xs mt-1 text-gray-500">Upload each image in Media Manager first, then reference its URL here.</p>
          </div>

          {error && <p className="text-sm text-red-400 font-semibold">{error}</p>}

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_published}
                     onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} />
              <span className="text-sm text-gray-300 font-medium">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured}
                     onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} />
              <span className="text-sm text-gray-300 font-medium">Featured (shown on /portfolio)</span>
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
                <p className="text-gray-500 text-xs">{c.client_name} &middot; {c.industry}{c.channel ? ` · ${c.channel}` : ''}</p>
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
