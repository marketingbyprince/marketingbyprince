'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
function Input({ value, onChange, placeholder }) {
  return (
    <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
           className="w-full rounded-lg px-3 py-2.5 text-sm"
           style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }} />
  )
}
function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
              className="w-full rounded-lg px-3 py-2.5 text-sm resize-y"
              style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }} />
  )
}

export default function GlobalSeoPage() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('seo_global_settings').select('*').limit(1).then(({ data }) => {
      setSettings(data?.[0] || {})
    })
  }, [])

  const set = (field) => (val) => setSettings(prev => ({ ...prev, [field]: val }))

  const save = async () => {
    setSaving(true)
    if (settings.id) {
      await supabase.from('seo_global_settings').update(settings).eq('id', settings.id)
    } else {
      const { data } = await supabase.from('seo_global_settings').insert(settings).select().single()
      if (data) setSettings(data)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!settings) return <div className="p-8 text-gray-400 text-sm">Loading…</div>

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Global SEO Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Site-wide defaults, verifications, org schema, and social profiles</p>
      </div>

      <div className="rounded-2xl border p-6 space-y-6"
           style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
        <h2 className="text-white font-bold">Site Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Site Name">
            <Input value={settings.site_name} onChange={set('site_name')} placeholder="Marketing By Prince" />
          </Field>
          <Field label="Default Title Suffix">
            <Input value={settings.default_title_suffix} onChange={set('default_title_suffix')} placeholder=" | Marketing By Prince" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Default Meta Description">
              <Textarea value={settings.default_description} onChange={set('default_description')} rows={2} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Default OG Image URL">
              <Input value={settings.default_og_image} onChange={set('default_og_image')} placeholder="https://..." />
            </Field>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-6 space-y-6"
           style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
        <h2 className="text-white font-bold">Social Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            ['twitter_handle', 'Twitter Handle', '@yourhandle'],
            ['facebook_url', 'Facebook URL', 'https://facebook.com/...'],
            ['linkedin_url', 'LinkedIn URL', 'https://linkedin.com/in/...'],
            ['instagram_url', 'Instagram URL', 'https://instagram.com/...'],
            ['youtube_url', 'YouTube URL', 'https://youtube.com/...'],
          ].map(([field, label, placeholder]) => (
            <Field key={field} label={label}>
              <Input value={settings[field]} onChange={set(field)} placeholder={placeholder} />
            </Field>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-6 space-y-6"
           style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
        <h2 className="text-white font-bold">Search Engine Verifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Google Search Console Verification">
            <Input value={settings.google_verification} onChange={set('google_verification')} placeholder="google-site-verification=..." />
          </Field>
          <Field label="Bing Webmaster Verification">
            <Input value={settings.bing_verification} onChange={set('bing_verification')} placeholder="msvalidate.01=..." />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border p-6 space-y-4"
           style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
        <h2 className="text-white font-bold">robots.txt Content</h2>
        <Textarea value={settings.robots_txt} onChange={set('robots_txt')}
                  placeholder={'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://marketingbyprince.com/sitemap.xml'} rows={8} />
        <p className="text-xs text-gray-500">This content is served by your <code className="text-orange-400">/robots.txt</code> route handler.</p>
      </div>

      <div className="rounded-2xl border p-6 space-y-4"
           style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
        <h2 className="text-white font-bold">Organization Schema (JSON-LD)</h2>
        <textarea
          value={settings.org_schema ? JSON.stringify(settings.org_schema, null, 2) : ''}
          onChange={e => { try { set('org_schema')(JSON.parse(e.target.value)) } catch {} }}
          rows={12}
          className="w-full rounded-lg px-3 py-2.5 text-xs font-mono resize-y"
          style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }}
          placeholder='{"@context": "https://schema.org", "@type": "Organization", "name": "Marketing By Prince"}'
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: 'var(--accent)' }}>
          {saving ? 'Saving…' : 'Save Global Settings'}
        </button>
        {saved && <span className="text-sm text-green-400 font-semibold">✓ Saved</span>}
      </div>
    </div>
  )
}
