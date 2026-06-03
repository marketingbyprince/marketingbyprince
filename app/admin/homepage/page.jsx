'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import AdminPageShell from '@/components/admin/AdminPageShell'

/* ── Tab IDs ──────────────────────────────────────────────────── */
const TABS = [
  { id: 'hero',     label: 'Hero' },
  { id: 'slides',   label: 'Hero Slides' },
  { id: 'stats',    label: 'Stats' },
  { id: 'services', label: 'Services' },
  { id: 'process',  label: 'Process' },
  { id: 'results',  label: 'Results' },
  { id: 'pricing',  label: 'Pricing' },
  { id: 'footer',   label: 'Footer' },
]

/* ── Shared field component ──────────────────────────────────────  */
function Field({ label, children }) {
  return (
    <div className="mb-5">
      <label className="admin-label">{label}</label>
      {children}
    </div>
  )
}

function SaveBtn({ saving, onClick, label = 'Save Changes' }) {
  return (
    <button onClick={onClick} disabled={saving} className="btn-admin mt-2">
      {saving ? 'Saving…' : label}
    </button>
  )
}

/* ─────────────────────────────────────────────
   HERO SLIDES MANAGER
───────────────────────────────────────────── */
function SlidesManager() {
  const [slides,   setSlides]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [preview,  setPreview]  = useState(false)
  const [saveError,setSaveError]= useState('')
  const [form,     setForm]     = useState({ image_url: '', alt_text: '', display_order: 1, is_active: true, start_date: '', end_date: '' })
  const [editing,  setEditing]  = useState(null)
  const [uploading,setUploading]= useState(false)
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('hero_slides').select('*').order('display_order')
    if (error) console.error('hero_slides load error:', error)
    setSlides(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd  = () => { setForm({ image_url: '', alt_text: '', display_order: (slides.length || 0) + 1, is_active: true, start_date: '', end_date: '' }); setEditing('new') }
  const openEdit = (s) => { setForm({ ...s, start_date: s.start_date?.slice(0, 16) ?? '', end_date: s.end_date?.slice(0, 16) ?? '' }); setEditing(s.id) }
  const closeForm = () => setEditing(null)

  async function uploadImage(file) {
    if (!file) return
    const allowed = ['image/jpeg','image/png','image/webp']
    if (!allowed.includes(file.type)) { alert('Only JPG, PNG, WebP allowed.'); return }
    if (file.size > 2 * 1024 * 1024) { alert('Max file size is 2MB.'); return }
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `hero-slides/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('website-assets').upload(path, file, { upsert: false })
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(path)
    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploading(false)
  }

  async function save() {
    if (!form.image_url) { setSaveError('Image URL is required. Upload a file or paste a URL.'); return }
    setSaving(true)
    setSaveError('')
    const payload = {
      image_url:     form.image_url,
      alt_text:      form.alt_text,
      display_order: Number(form.display_order),
      is_active:     form.is_active,
      start_date:    form.start_date ? new Date(form.start_date).toISOString() : new Date().toISOString(),
      end_date:      form.end_date   ? new Date(form.end_date).toISOString()   : null,
    }
    let error
    if (editing === 'new') {
      ;({ error } = await supabase.from('hero_slides').insert([payload]))
    } else {
      ;({ error } = await supabase.from('hero_slides').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing))
    }
    setSaving(false)
    if (error) {
      setSaveError(`Save failed: ${error.message} — Run the RLS fix SQL shown below.`)
      return
    }
    closeForm()
    load()
  }

  async function remove(id) {
    if (!confirm('Delete this slide?')) return
    const { error } = await supabase.from('hero_slides').delete().eq('id', id)
    if (error) alert('Delete failed: ' + error.message)
    else load()
  }

  async function toggleActive(slide) {
    await supabase.from('hero_slides').update({ is_active: !slide.is_active }).eq('id', slide.id)
    load()
  }

  async function moveUp(i) {
    if (i === 0) return
    const a = slides[i], b = slides[i - 1]
    await supabase.from('hero_slides').update({ display_order: b.display_order }).eq('id', a.id)
    await supabase.from('hero_slides').update({ display_order: a.display_order }).eq('id', b.id)
    load()
  }

  const activeNow = slides.filter(s => {
    if (!s.is_active) return false
    const now = Date.now()
    const start = new Date(s.start_date).getTime()
    const end   = s.end_date ? new Date(s.end_date).getTime() : Infinity
    return now >= start && now <= end
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h3 className="text-white font-bold text-base">Hero Slide Manager</h3>
        <div className="flex gap-3">
          <button onClick={() => setPreview(p => !p)} className="btn-secondary btn-sm">
            {preview ? 'Hide Preview' : 'Preview Slider'}
          </button>
          <button onClick={openAdd} className="btn-admin btn-sm">+ Add Slide</button>
        </div>
      </div>

      {/* Slider preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setPreview(false)}>
          <div className="bg-white rounded-xl p-4 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-gray-800">Active Slides Preview ({activeNow.length})</span>
              <button onClick={() => setPreview(false)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
            </div>
            {activeNow.length === 0 ? (
              <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 text-sm">No active slides</div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {activeNow.map(s => (
                  <div key={s.id} className="shrink-0">
                    <img src={s.image_url} alt={s.alt_text} className="h-40 w-64 object-cover rounded-lg border border-gray-200" />
                    <p className="text-xs text-gray-500 mt-1 truncate w-64">{s.alt_text || 'No alt text'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/edit form */}
      {editing !== null && (
        <div className="admin-card p-5 mb-6 rounded-xl">
          <h4 className="text-white font-semibold mb-4 text-sm">{editing === 'new' ? 'Add New Slide' : 'Edit Slide'}</h4>

          <Field label="Image Upload (JPG/PNG/WebP, max 2MB, 1920×1080 recommended)">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e => uploadImage(e.target.files[0])} />
            <div className="flex gap-3 items-center flex-wrap">
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-secondary btn-sm">
                {uploading ? 'Uploading…' : 'Choose File'}
              </button>
              {form.image_url && (
                <img src={form.image_url} alt="" className="h-14 w-24 object-cover rounded border border-gray-700" />
              )}
            </div>
          </Field>

          <Field label="Image URL (or paste URL directly)">
            <input className="admin-input" value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://…" />
          </Field>

          <Field label="Alt Text">
            <input className="admin-input" value={form.alt_text}
              onChange={e => setForm(f => ({ ...f, alt_text: e.target.value }))} placeholder="Describe the image" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Display Order">
              <input type="number" className="admin-input" value={form.display_order}
                onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} min={1} />
            </Field>
            <Field label="Active">
              <select className="admin-input" value={form.is_active ? 'true' : 'false'}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date & Time">
              <input type="datetime-local" className="admin-input" value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </Field>
            <Field label="End Date & Time (leave blank = no end)">
              <input type="datetime-local" className="admin-input" value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </Field>
          </div>

          {saveError && (
            <div className="mt-3 p-3 rounded-lg bg-red-900/30 border border-red-700">
              <p className="text-red-300 text-xs">{saveError}</p>
            </div>
          )}
          <div className="flex gap-3 mt-3">
            <SaveBtn saving={saving} onClick={save} />
            <button onClick={closeForm} className="btn-ghost btn-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Slide list */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner" /></div>
      ) : slides.length === 0 ? (
        <p className="text-gray-400 text-sm">No slides yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, i) => (
            <div key={slide.id} className="admin-card p-4 flex items-center gap-4 rounded-xl">
              {slide.image_url
                ? <img src={slide.image_url} alt={slide.alt_text} className="w-20 h-14 object-cover rounded-lg shrink-0" />
                : <div className="w-20 h-14 bg-gray-700 rounded-lg shrink-0 flex items-center justify-center text-gray-500 text-xs">No image</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{slide.alt_text || 'Untitled slide'}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Order {slide.display_order} · {slide.is_active ? '✅ Active' : '⏸ Inactive'} ·
                  {slide.start_date ? ` From ${new Date(slide.start_date).toLocaleDateString()}` : ' No start'}
                  {slide.end_date ? ` → ${new Date(slide.end_date).toLocaleDateString()}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => moveUp(i)} disabled={i === 0} className="text-gray-400 hover:text-white px-2 py-1 text-xs disabled:opacity-30">↑</button>
                <button onClick={() => toggleActive(slide)} className="text-gray-400 hover:text-white px-2 py-1 text-xs">
                  {slide.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => openEdit(slide)} className="text-gray-400 hover:text-white px-2 py-1 text-xs">Edit</button>
                <button onClick={() => remove(slide.id)} className="text-red-400 hover:text-red-300 px-2 py-1 text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

/* ─────────────────────────────────────────────
   SERVICES HOMEPAGE VISIBILITY
───────────────────────────────────────────── */
function ServicesManager() {
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('services').select('id,title,is_active,show_on_homepage,homepage_order').eq('is_active', true).order('homepage_order')
    setServices(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const homepageCount = services.filter(s => s.show_on_homepage).length

  async function toggleHomepage(svc) {
    if (!svc.show_on_homepage && homepageCount >= 10) {
      alert('Maximum 10 services can be shown on the homepage. Deselect one first.')
      return
    }
    setSaving(svc.id)
    await supabase.from('services').update({ show_on_homepage: !svc.show_on_homepage }).eq('id', svc.id)
    setSaving(null)
    load()
  }

  async function updateOrder(svc, newOrder) {
    await supabase.from('services').update({ homepage_order: Number(newOrder) }).eq('id', svc.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-white font-bold text-base">Homepage Visibility</h3>
        <span className="badge-accent">{homepageCount}/10 selected</span>
      </div>
      <p className="text-gray-400 text-sm mb-6">Toggle "Show on Homepage" for up to 10 services. These appear in order on the homepage services grid.</p>

      {loading ? <div className="flex justify-center py-10"><div className="spinner" /></div> : (
        <div className="space-y-2">
          {services.map(svc => (
            <div key={svc.id} className="admin-card px-4 py-3 flex items-center gap-4 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{svc.title}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <label className="admin-label mb-0 text-xs">Order</label>
                  <input
                    type="number" min={1} max={99}
                    defaultValue={svc.homepage_order ?? 99}
                    className="admin-input w-16 py-1 text-xs"
                    onBlur={e => updateOrder(svc, e.target.value)}
                  />
                </div>
                <button
                  onClick={() => toggleHomepage(svc)}
                  disabled={saving === svc.id}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    svc.show_on_homepage
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:border-accent/30 hover:text-accent'
                  }`}
                >
                  {saving === svc.id ? '…' : svc.show_on_homepage ? '✓ On Homepage' : 'Show on Homepage'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   SIMPLE KEY-VALUE SECTION MANAGER
   Reads/writes to site_settings table
───────────────────────────────────────────── */
function SettingsSection({ sectionKey, fields, title }) {
  const [values,  setValues]  = useState({})
  const [saving,  setSaving]  = useState(false)
  const [loaded,  setLoaded]  = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('key,value').like('key', `${sectionKey}_%`)
      .then(({ data }) => {
        const map = {}
        ;(data ?? []).forEach(r => { map[r.key.replace(`${sectionKey}_`, '')] = r.value })
        setValues(map)
        setLoaded(true)
      })
  }, [sectionKey])

  async function save() {
    setSaving(true)
    const upserts = fields.map(f => ({
      key: `${sectionKey}_${f.key}`,
      value: values[f.key] ?? '',
    }))
    await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })
    setSaving(false)
  }

  if (!loaded) return <div className="flex justify-center py-8"><div className="spinner-sm" /></div>

  return (
    <div>
      <h3 className="text-white font-bold text-base mb-6">{title}</h3>
      {fields.map(f => (
        <Field key={f.key} label={f.label}>
          {f.type === 'textarea' ? (
            <textarea
              rows={3}
              className="admin-input resize-none"
              value={values[f.key] ?? ''}
              onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder ?? ''}
            />
          ) : (
            <input
              type={f.type ?? 'text'}
              className="admin-input"
              value={values[f.key] ?? ''}
              onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder ?? ''}
            />
          )}
        </Field>
      ))}
      <SaveBtn saving={saving} onClick={save} />

      {/* site_settings notice */}
      <p className="text-gray-500 text-xs mt-4">
        Note: These values are stored in a <code className="text-gray-400">site_settings</code> table.
        Run{' '}
        <code className="text-gray-400">CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT);</code>
        {' '}in Supabase if not already done.
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function HomepageManagerPage() {
  const [tab, setTab] = useState('hero')

  return (
    <AdminPageShell title="Homepage Manager">
      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap mb-8 border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-accent text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'hero' && (
          <SettingsSection
            sectionKey="hero"
            title="Hero Section"
            fields={[
              { key: 'headline',      label: 'Headline',                placeholder: 'Performance Marketing for Brands Ready to Scale' },
              { key: 'subheadline',   label: 'Subheadline',             placeholder: 'I manage $12K+/mo in ad spend…', type: 'textarea' },
              { key: 'cta_primary',   label: 'Primary CTA Text',        placeholder: 'Book a Strategy Call' },
              { key: 'cta_secondary', label: 'Secondary CTA Text',      placeholder: 'View Case Studies →' },
              { key: 'trust_bar',     label: 'Trust Bar Clients (comma-separated)', placeholder: 'Client A, Client B, Client C' },
            ]}
          />
        )}

        {tab === 'slides' && <SlidesManager />}

        {tab === 'stats' && (
          <SettingsSection
            sectionKey="stats"
            title="Stats Strip"
            fields={[
              { key: 'stat1_number', label: 'Stat 1 Number', placeholder: '3+' },
              { key: 'stat1_label',  label: 'Stat 1 Label',  placeholder: 'Years Experience' },
              { key: 'stat2_number', label: 'Stat 2 Number', placeholder: '40+' },
              { key: 'stat2_label',  label: 'Stat 2 Label',  placeholder: 'Client Accounts' },
              { key: 'stat3_number', label: 'Stat 3 Number', placeholder: '$12K+' },
              { key: 'stat3_label',  label: 'Stat 3 Label',  placeholder: 'Monthly Ad Budget Managed' },
              { key: 'stat4_number', label: 'Stat 4 Number', placeholder: '10x' },
              { key: 'stat4_label',  label: 'Stat 4 Label',  placeholder: 'Peak ROAS' },
            ]}
          />
        )}

        {tab === 'services' && <ServicesManager />}

        {tab === 'process' && (
          <SettingsSection
            sectionKey="process"
            title="Process Steps"
            fields={[
              { key: 'step1_title', label: 'Step 1 Title', placeholder: 'Audit' },
              { key: 'step1_desc',  label: 'Step 1 Description', type: 'textarea', placeholder: 'Deep-dive into your current ad accounts…' },
              { key: 'step2_title', label: 'Step 2 Title', placeholder: 'Build' },
              { key: 'step2_desc',  label: 'Step 2 Description', type: 'textarea', placeholder: 'Architecture of campaigns…' },
              { key: 'step3_title', label: 'Step 3 Title', placeholder: 'Scale' },
              { key: 'step3_desc',  label: 'Step 3 Description', type: 'textarea', placeholder: 'Aggressive budget allocation…' },
              { key: 'step4_title', label: 'Step 4 Title', placeholder: 'Optimize' },
              { key: 'step4_desc',  label: 'Step 4 Description', type: 'textarea', placeholder: 'Continuous A/B testing…' },
            ]}
          />
        )}

        {tab === 'results' && (
          <SettingsSection
            sectionKey="results"
            title="Results / Case Study Teaser"
            fields={[
              { key: 'headline',    label: 'Section Headline', placeholder: 'Real Results, Not Just Reports' },
              { key: 'stat',        label: 'Big Stat', placeholder: '10x Peak ROAS' },
              { key: 'description', label: 'Description', type: 'textarea', placeholder: 'For a D2C brand in India…' },
              { key: 'cta_link',    label: 'Portfolio Link', placeholder: '/portfolio' },
            ]}
          />
        )}

        {tab === 'pricing' && (
          <SettingsSection
            sectionKey="pricing"
            title="Pricing Teaser"
            fields={[
              { key: 'card_title',   label: 'Card Title',   placeholder: 'Overall Digital Growth' },
              { key: 'card_desc',    label: 'Card Subtitle', placeholder: 'Custom Retainer — Tailored for brands…' },
              { key: 'bullet1',      label: 'Bullet 1',     placeholder: 'Full-funnel strategy' },
              { key: 'bullet2',      label: 'Bullet 2',     placeholder: 'Dedicated account management' },
              { key: 'bullet3',      label: 'Bullet 3',     placeholder: 'Weekly performance reviews' },
              { key: 'bullet4',      label: 'Bullet 4',     placeholder: 'Priority support & optimization' },
              { key: 'cta_text',     label: 'CTA Button Text', placeholder: 'Book a Discovery Call' },
              { key: 'disclaimer',   label: 'Disclaimer Text', type: 'textarea', placeholder: 'All engagements begin with a paid audit…' },
            ]}
          />
        )}

        {tab === 'footer' && (
          <SettingsSection
            sectionKey="footer"
            title="Footer"
            fields={[
              { key: 'tagline',       label: 'Tagline',          placeholder: 'Helping brands grow with data-driven performance marketing.' },
              { key: 'linkedin_url',  label: 'LinkedIn URL',     placeholder: 'https://linkedin.com/in/…' },
              { key: 'email',         label: 'Email',            placeholder: 'marketingbyprince@gmail.com' },
              { key: 'phone',         label: 'Phone',            placeholder: '+91XXXXXXXXXX' },
              { key: 'copyright',     label: 'Copyright Text',   placeholder: '©2026 Prince Pandey. All rights reserved.' },
            ]}
          />
        )}
      </div>
    </AdminPageShell>
  )
}
