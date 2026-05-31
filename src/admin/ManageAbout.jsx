import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import AdminLayout from './AdminLayout'
import { generateResume } from '../lib/resumeUtils'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// ─── Tiny helpers ────────────────────────────────────────────────────────────
function Label({ children }) {
  return <label className="admin-label">{children}</label>
}
function Input({ ...props }) {
  return <input className="admin-input" {...props} />
}
function Textarea({ ...props }) {
  return <textarea className="admin-input resize-none" {...props} />
}
function Btn({ children, variant = 'primary', size = 'sm', className = '', ...props }) {
  const base = 'btn-admin'
  const sz   = size === 'sm' ? 'btn-sm' : 'btn-md'
  return <button className={`${base} ${sz} ${className}`} {...props}>{children}</button>
}
function DangerBtn({ children, className = '', ...props }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors ${className}`}
      {...props}
    >{children}</button>
  )
}
function SectionCard({ title, children }) {
  return (
    <div className="admin-card rounded-2xl p-6 mb-6">
      <h2 className="text-white font-extrabold text-base mb-5 pb-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}
function SaveBar({ saving, onSave, error }) {
  return (
    <div className="flex items-center gap-3 mt-5">
      <Btn size="md" onClick={onSave} disabled={saving} className="disabled:opacity-60">
        {saving ? 'Saving…' : 'Save Changes'}
      </Btn>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-gray-700'}`}
        style={checked ? { backgroundColor: 'var(--accent)' } : {}}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  )
}
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="admin-card rounded-2xl p-6 max-w-sm w-full">
        <p className="text-white text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-60 transition-colors">
            {loading ? 'Deleting…' : 'Delete'}
          </button>
          <button onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm font-bold border border-gray-700 text-gray-300 hover:border-gray-500 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function fmtDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}

// ─── Profile Section ─────────────────────────────────────────────────────────
function ProfileSection() {
  const [data, setData]     = useState(null)
  const [form, setForm]     = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)
  const [imgPreview, setImgPreview] = useState('')

  useEffect(() => {
    supabase.from('about_content').select('*').single()
      .then(({ data: d }) => {
        setData(d)
        setForm(d || {})
        setImgPreview(d?.profile_image_url || '')
      })
  }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const save = async () => {
    setSaving(true); setError(null)
    const { id, ...payload } = form
    let err
    if (data?.id) {
      ;({ error: err } = await supabase.from('about_content').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', data.id))
    } else {
      ;({ error: err } = await supabase.from('about_content').insert([payload]))
    }
    if (err) setError(err.message)
    setSaving(false)
  }

  const descLen = (form.description || '').length
  const descOver = descLen > 550

  return (
    <SectionCard title="Profile & Contact">
      <div className="grid md:grid-cols-2 gap-6">

        {/* Image */}
        <div className="md:col-span-2">
          <Label>Profile Image URL</Label>
          <div className="flex gap-3 items-start">
            <Input
              type="url"
              value={form.profile_image_url || ''}
              onChange={e => { set('profile_image_url', e.target.value); setImgPreview(e.target.value) }}
              placeholder="https://…"
              className="flex-1"
            />
            {imgPreview && (
              <img src={imgPreview} alt="preview" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-700" />
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input value={form.name || ''} onChange={e => set('name', e.target.value)} />
        </div>

        {/* Tagline */}
        <div>
          <Label>Tagline</Label>
          <Input value={form.tagline || ''} onChange={e => set('tagline', e.target.value)} placeholder="Digital Marketing Expert | PPC | SEO" />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <Label>Description</Label>
            <span className={`text-xs font-bold ${descOver ? 'text-red-400' : 'text-gray-500'}`}>{descLen}/600</span>
          </div>
          <Textarea
            rows={5}
            value={form.description || ''}
            onChange={e => set('description', e.target.value)}
            maxLength={600}
          />
          {descOver && <p className="text-red-400 text-xs mt-1">Exceeding 550 chars may affect layout</p>}
        </div>

        {/* Phone */}
        <div>
          <Label>Phone</Label>
          <Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXXXXXXX" />
          {form.phone && (
            <a href={`tel:${form.phone}`} className="text-xs mt-1 inline-block hover:text-accent" style={{ color: 'var(--admin-muted)' }}>
              📞 {form.phone}
            </a>
          )}
        </div>

        {/* Email */}
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
          {form.email && (
            <a href={`mailto:${form.email}`} className="text-xs mt-1 inline-block hover:text-accent" style={{ color: 'var(--admin-muted)' }}>
              ✉ {form.email}
            </a>
          )}
        </div>

        {/* Location */}
        <div className="md:col-span-2 space-y-3">
          <Toggle
            checked={!!form.is_location_visible}
            onChange={v => set('is_location_visible', v)}
            label="Show location on public page"
          />
          {form.is_location_visible && (
            <Input value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="City, State / Country" />
          )}
        </div>
      </div>

      <SaveBar saving={saving} onSave={save} error={error} />
    </SectionCard>
  )
}

// ─── Work Experience Section ─────────────────────────────────────────────────
const BLANK_EXP = { company: '', role: '', start_date: '', end_date: '', is_current: false, description: '', sort_order: 0 }

function WorkSection() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)  // null | 'add' | row
  const [form, setForm]       = useState(BLANK_EXP)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('work_experience').select('*').order('sort_order')
    setRows(data || [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openAdd  = () => { setForm({ ...BLANK_EXP, sort_order: rows.length + 1 }); setError(null); setModal('add') }
  const openEdit = r  => { setForm({ ...r }); setError(null); setModal(r) }

  const save = async () => {
    if (!form.company || !form.role || !form.start_date) { setError('Company, Role and Start Date are required'); return }
    setSaving(true); setError(null)
    const { id, created_at, ...payload } = form
    if (form.is_current) payload.end_date = null
    let err
    if (modal === 'add') {
      ;({ error: err } = await supabase.from('work_experience').insert([payload]))
    } else {
      ;({ error: err } = await supabase.from('work_experience').update(payload).eq('id', modal.id))
    }
    if (err) { setError(err.message); setSaving(false); return }
    await load(); setModal(null); setSaving(false)
  }

  const del = async () => {
    setDeleting(true)
    await supabase.from('work_experience').delete().eq('id', delTarget.id)
    setDeleting(false); setDelTarget(null); load()
  }

  return (
    <SectionCard title="Work Experience">
      <div className="flex justify-end mb-4">
        <Btn onClick={openAdd}>+ Add Experience</Btn>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner" /></div>
      ) : rows.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-8">No experience added yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r.id} className="rounded-xl p-4 border flex items-start justify-between gap-4" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-bold text-sm">{r.role}</p>
                  {r.is_current && <span className="px-2 py-0.5 rounded-full text-xs font-bold text-green-400 bg-green-500/10">Current</span>}
                </div>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>{r.company}</p>
                <p className="text-xs text-gray-500 mt-0.5">{fmtDate(r.start_date)} – {r.is_current ? 'Present' : fmtDate(r.end_date)}</p>
                {r.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{r.description}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <Btn onClick={() => openEdit(r)}>Edit</Btn>
                <DangerBtn onClick={() => setDelTarget(r)}>Delete</DangerBtn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="admin-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-white font-extrabold mb-5">{modal === 'add' ? 'Add Experience' : 'Edit Experience'}</h3>
            <div className="space-y-4">
              <div><Label>Company *</Label><Input value={form.company} onChange={e => set('company', e.target.value)} /></div>
              <div><Label>Role *</Label><Input value={form.role} onChange={e => set('role', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} /></div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={form.end_date || ''} onChange={e => set('end_date', e.target.value)} disabled={form.is_current} className="disabled:opacity-40" />
                </div>
              </div>
              <Toggle checked={!!form.is_current} onChange={v => set('is_current', v)} label="Currently working here" />
              <div><Label>Description</Label><Textarea rows={4} value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Key responsibilities and achievements…" /></div>
              <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></div>
            </div>
            {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
            <div className="flex gap-3 mt-5">
              <Btn size="md" onClick={save} disabled={saving} className="flex-1 disabled:opacity-60">{saving ? 'Saving…' : modal === 'add' ? 'Add' : 'Save'}</Btn>
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl text-sm font-bold border border-gray-700 text-gray-300 hover:border-gray-500 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {delTarget && <ConfirmModal message={`Delete "${delTarget.role} at ${delTarget.company}"?`} onConfirm={del} onCancel={() => setDelTarget(null)} loading={deleting} />}
    </SectionCard>
  )
}

// ─── Skills Section ──────────────────────────────────────────────────────────
const BLANK_SKILL = { name: '', category: '', proficiency_level: 'Expert', sort_order: 0 }

function SkillsSection() {
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState(BLANK_SKILL)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('skills').select('*').order('category').order('sort_order')
    setRows(data || [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const categories = [...new Set(rows.map(r => r.category).filter(Boolean))]
  const grouped = rows.reduce((acc, r) => {
    const cat = r.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  const save = async () => {
    if (!form.name) { setError('Skill name is required'); return }
    setSaving(true); setError(null)
    const { id, created_at, ...payload } = form
    let err
    if (modal === 'add') {
      ;({ error: err } = await supabase.from('skills').insert([payload]))
    } else {
      ;({ error: err } = await supabase.from('skills').update(payload).eq('id', modal.id))
    }
    if (err) { setError(err.message); setSaving(false); return }
    await load(); setModal(null); setSaving(false)
  }

  const del = async () => {
    setDeleting(true)
    await supabase.from('skills').delete().eq('id', delTarget.id)
    setDeleting(false); setDelTarget(null); load()
  }

  const LEVELS = ['Beginner', 'Intermediate', 'Expert']
  const levelColor = l => l === 'Expert' ? '#22c55e' : l === 'Intermediate' ? '#f59e0b' : '#6b7280'

  return (
    <SectionCard title="Skills & Expertise">
      <div className="flex justify-end mb-4">
        <Btn onClick={() => { setForm({ ...BLANK_SKILL, sort_order: rows.length + 1 }); setError(null); setModal('add') }}>+ Add Skill</Btn>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner" /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-8">No skills added yet.</p>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([cat, skills]) => (
            <div key={cat}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <div key={s.id} className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all"
                       style={{ borderColor: 'var(--admin-border)', color: '#d1d5db' }}>
                    <span>{s.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: levelColor(s.proficiency_level) }} />
                    <button onClick={() => { setForm({ ...s }); setError(null); setModal(s) }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity ml-1">✏️</button>
                    <button onClick={() => setDelTarget(s)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="admin-card rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-extrabold mb-5">{modal === 'add' ? 'Add Skill' : 'Edit Skill'}</h3>
            <div className="space-y-4">
              <div><Label>Skill Name *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
              <div>
                <Label>Category</Label>
                <Input
                  list="cat-suggestions"
                  value={form.category || ''}
                  onChange={e => set('category', e.target.value)}
                  placeholder="e.g. Paid Ads, SEO, Analytics"
                />
                <datalist id="cat-suggestions">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <Label>Proficiency</Label>
                <select value={form.proficiency_level || 'Expert'} onChange={e => set('proficiency_level', e.target.value)} className="admin-input">
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></div>
            </div>
            {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
            <div className="flex gap-3 mt-5">
              <Btn size="md" onClick={save} disabled={saving} className="flex-1 disabled:opacity-60">{saving ? 'Saving…' : modal === 'add' ? 'Add' : 'Save'}</Btn>
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl text-sm font-bold border border-gray-700 text-gray-300 hover:border-gray-500 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {delTarget && <ConfirmModal message={`Delete skill "${delTarget.name}"?`} onConfirm={del} onCancel={() => setDelTarget(null)} loading={deleting} />}
    </SectionCard>
  )
}

// ─── Education Section ───────────────────────────────────────────────────────
const BLANK_EDU = { institution: '', degree: '', field_of_study: '', start_year: '', end_year: '', is_current: false, sort_order: 0 }

function EducationSection() {
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState(BLANK_EDU)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('education').select('*').order('sort_order')
    setRows(data || [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const save = async () => {
    if (!form.institution || !form.degree) { setError('Institution and Degree are required'); return }
    setSaving(true); setError(null)
    const { id, created_at, ...payload } = form
    if (form.is_current) payload.end_year = null
    let err
    if (modal === 'add') {
      ;({ error: err } = await supabase.from('education').insert([payload]))
    } else {
      ;({ error: err } = await supabase.from('education').update(payload).eq('id', modal.id))
    }
    if (err) { setError(err.message); setSaving(false); return }
    await load(); setModal(null); setSaving(false)
  }

  const del = async () => {
    setDeleting(true)
    await supabase.from('education').delete().eq('id', delTarget.id)
    setDeleting(false); setDelTarget(null); load()
  }

  return (
    <SectionCard title="Academic Background">
      <div className="flex justify-end mb-4">
        <Btn onClick={() => { setForm({ ...BLANK_EDU, sort_order: rows.length + 1 }); setError(null); setModal('add') }}>+ Add Education</Btn>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner" /></div>
      ) : rows.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-8">No education added yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r.id} className="rounded-xl p-4 border flex items-start justify-between gap-4" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">{r.degree}{r.field_of_study ? ` in ${r.field_of_study}` : ''}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>{r.institution}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.start_year} – {r.is_current ? 'Ongoing' : r.end_year}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Btn onClick={() => { setForm({ ...r }); setError(null); setModal(r) }}>Edit</Btn>
                <DangerBtn onClick={() => setDelTarget(r)}>Delete</DangerBtn>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="admin-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-white font-extrabold mb-5">{modal === 'add' ? 'Add Education' : 'Edit Education'}</h3>
            <div className="space-y-4">
              <div><Label>Institution *</Label><Input value={form.institution} onChange={e => set('institution', e.target.value)} /></div>
              <div><Label>Degree *</Label><Input value={form.degree} onChange={e => set('degree', e.target.value)} /></div>
              <div><Label>Field of Study</Label><Input value={form.field_of_study || ''} onChange={e => set('field_of_study', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Year</Label><Input type="number" value={form.start_year || ''} onChange={e => set('start_year', e.target.value ? Number(e.target.value) : '')} placeholder="2019" /></div>
                <div><Label>End Year</Label><Input type="number" value={form.end_year || ''} onChange={e => set('end_year', e.target.value ? Number(e.target.value) : '')} disabled={form.is_current} className="disabled:opacity-40" placeholder="2023" /></div>
              </div>
              <Toggle checked={!!form.is_current} onChange={v => set('is_current', v)} label="Currently studying here" />
              <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></div>
            </div>
            {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
            <div className="flex gap-3 mt-5">
              <Btn size="md" onClick={save} disabled={saving} className="flex-1 disabled:opacity-60">{saving ? 'Saving…' : modal === 'add' ? 'Add' : 'Save'}</Btn>
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl text-sm font-bold border border-gray-700 text-gray-300 hover:border-gray-500 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {delTarget && <ConfirmModal message={`Delete "${delTarget.degree}" from ${delTarget.institution}?`} onConfirm={del} onCancel={() => setDelTarget(null)} loading={deleting} />}
    </SectionCard>
  )
}

// ─── Case Studies Section ────────────────────────────────────────────────────
const BLANK_CS = { client_name: '', industry: '', challenge: '', results: '', key_metrics: '', portfolio_url: '', is_visible_on_resume: true, sort_order: 0 }

function CaseStudiesSection() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [form, setForm]         = useState(BLANK_CS)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting]   = useState(false)
  const [scanning, setScanning]   = useState(false)
  const [scanStatus, setScanStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('case_studies').select('*').order('sort_order')
    setRows(data || [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openAdd  = () => { setForm({ ...BLANK_CS, sort_order: rows.length + 1 }); setError(null); setModal('add') }
  const openEdit = r  => { setForm({ ...r, key_metrics: typeof r.key_metrics === 'object' && r.key_metrics !== null ? JSON.stringify(r.key_metrics) : (r.key_metrics || '') }); setError(null); setModal(r) }

  const save = async () => {
    if (!form.client_name || !form.results) { setError('Client name and Results are required'); return }
    setSaving(true); setError(null)
    const { id, created_at, ...payload } = form
    let err
    if (modal === 'add') {
      ;({ error: err } = await supabase.from('case_studies').insert([{ ...payload, source: 'manual' }]))
    } else {
      ;({ error: err } = await supabase.from('case_studies').update(payload).eq('id', modal.id))
    }
    if (err) { setError(err.message); setSaving(false); return }
    await load(); setModal(null); setSaving(false)
  }

  const del = async () => {
    setDeleting(true)
    await supabase.from('case_studies').delete().eq('id', delTarget.id)
    setDeleting(false); setDelTarget(null); load()
  }

  const toggleResume = async (row) => {
    await supabase.from('case_studies').update({ is_visible_on_resume: !row.is_visible_on_resume }).eq('id', row.id)
    load()
  }

  const scanWebsite = async () => {
    setScanning(true); setScanStatus('Scanning website…')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(`${SUPABASE_URL}/functions/v1/scan-portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ url: 'https://marketingbyprince.com' })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Scan failed')
      setScanStatus(`✅ ${json.count} case ${json.count === 1 ? 'study' : 'studies'} found and saved`)
      await load()
    } catch (e) {
      setScanStatus(`❌ ${e.message}`)
    }
    setScanning(false)
  }

  return (
    <SectionCard title="Case Studies & Portfolio">
      {/* Website Scanner */}
      <div className="rounded-xl p-4 mb-5 border" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
        <p className="text-white font-bold text-sm mb-1">🔍 AI Website Scanner</p>
        <p className="text-gray-400 text-xs mb-3">
          AI reads your live website (portfolio, case studies, results pages) and extracts client results automatically.
          Already-scanned entries won’t duplicate.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={scanWebsite}
            disabled={scanning}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {scanning ? '⏳ Scanning…' : '🌐 Scan Website'}
          </button>
          {scanStatus && <p className="text-xs text-gray-300">{scanStatus}</p>}
        </div>
      </div>

      {/* Manual list */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Manual Case Studies</p>
        <Btn onClick={openAdd}>+ Add Case Study</Btn>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner" /></div>
      ) : rows.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-8">No case studies yet. Add manually or scan your website.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r.id} className="rounded-xl p-4 border" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-bold text-sm">{r.client_name}</p>
                    {r.industry && <span className="px-2 py-0.5 rounded-full text-xs font-bold text-gray-400 border" style={{ borderColor: 'var(--admin-border)' }}>{r.industry}</span>}
                    {r.source === 'website_scan' && <span className="px-2 py-0.5 rounded-full text-xs font-bold text-blue-400 bg-blue-500/10">AI Scanned</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{r.results}</p>
                  {r.key_metrics && <p className="text-xs font-semibold mt-1" style={{ color: 'var(--accent)' }}>{typeof r.key_metrics === 'string' ? r.key_metrics : JSON.stringify(r.key_metrics)}</p>}
                  {r.portfolio_url && <a href={r.portfolio_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-0.5 inline-block truncate max-w-xs">{r.portfolio_url}</a>}
                </div>
                <div className="flex flex-col gap-2 shrink-0 items-end">
                  <div className="flex gap-2">
                    <Btn onClick={() => openEdit(r)}>Edit</Btn>
                    <DangerBtn onClick={() => setDelTarget(r)}>Delete</DangerBtn>
                  </div>
                  <Toggle checked={!!r.is_visible_on_resume} onChange={() => toggleResume(r)} label="In resume" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="admin-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-white font-extrabold mb-5">{modal === 'add' ? 'Add Case Study' : 'Edit Case Study'}</h3>
            <div className="space-y-4">
              <div><Label>Client / Brand Name *</Label><Input value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="e.g. Anand Toyota" /></div>
              <div><Label>Industry</Label><Input value={form.industry || ''} onChange={e => set('industry', e.target.value)} placeholder="e.g. Automotive, Healthcare" /></div>
              <div><Label>Challenge (what problem did they have?)</Label><Textarea rows={2} value={form.challenge || ''} onChange={e => set('challenge', e.target.value)} placeholder="Low online visibility, poor leads…" /></div>
              <div><Label>Result / What you did *</Label><Textarea rows={3} value={form.results} onChange={e => set('results', e.target.value)} placeholder="Ran Google Ads + local search campaigns achieving 60–70 quality leads/month…" /></div>
              <div><Label>Key Metrics</Label><Input value={form.key_metrics || ''} onChange={e => set('key_metrics', e.target.value)} placeholder="e.g. 3x ROAS, 40 leads/week, $12K budget" /></div>
              <div><Label>Portfolio URL (optional)</Label><Input type="url" value={form.portfolio_url || ''} onChange={e => set('portfolio_url', e.target.value)} placeholder="https://…" /></div>
              <Toggle checked={!!form.is_visible_on_resume} onChange={v => set('is_visible_on_resume', v)} label="Include in resume" />
              <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></div>
            </div>
            {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
            <div className="flex gap-3 mt-5">
              <Btn size="md" onClick={save} disabled={saving} className="flex-1 disabled:opacity-60">{saving ? 'Saving…' : modal === 'add' ? 'Add' : 'Save'}</Btn>
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl text-sm font-bold border border-gray-700 text-gray-300 hover:border-gray-500 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {delTarget && <ConfirmModal message={`Delete case study for "${delTarget.client_name}"?`} onConfirm={del} onCancel={() => setDelTarget(null)} loading={deleting} />}
    </SectionCard>
  )
}

// ─── Resume Section ──────────────────────────────────────────────────────────
function ResumeSection() {
  const [extraInfo, setExtraInfo] = useState('')
  const [aboutId, setAboutId]     = useState(null)
  const [saving, setSaving]       = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError]         = useState(null)

  useEffect(() => {
    supabase.from('about_content').select('id, resume_extra_info').single()
      .then(({ data }) => { if (data) { setAboutId(data.id); setExtraInfo(data.resume_extra_info || '') } })
  }, [])

  const saveExtra = async () => {
    if (!aboutId) return
    setSaving(true)
    await supabase.from('about_content').update({ resume_extra_info: extraInfo }).eq('id', aboutId)
    setSaving(false)
  }

  const handleGenerate = async () => {
    setGenerating(true); setError(null)
    try { await generateResume() }
    catch (e) { setError(e.message) }
    setGenerating(false)
  }

  return (
    <SectionCard title="Resume Generator">
      <p className="text-gray-400 text-sm mb-4">
        The resume PDF is auto-built from your profile, experience, skills, education and case studies above.
        Add any extra context (awards, freelance work, certifications) below.
      </p>

      <div className="mb-4">
        <Label>Extra Info for Resume (awards, projects, achievements)</Label>
        <Textarea
          rows={4}
          value={extraInfo}
          onChange={e => setExtraInfo(e.target.value)}
          placeholder="e.g. Freelance client work, Google Ads certification, awards…"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Btn size="md" onClick={saveExtra} disabled={saving} className="disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Extra Info'}
        </Btn>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {generating ? 'Generating PDF…' : '⬇ Download Resume PDF'}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </SectionCard>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ManageAbout() {
  return (
    <AdminLayout>
      <div className="p-6 sm:p-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">About Page</h1>
          <p className="text-gray-400 text-sm mt-1">Manage everything displayed on the public /about page</p>
        </div>

        <ProfileSection />
        <WorkSection />
        <SkillsSection />
        <EducationSection />
        <CaseStudiesSection />
        <ResumeSection />
      </div>
    </AdminLayout>
  )
}
