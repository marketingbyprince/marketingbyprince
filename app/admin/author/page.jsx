'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'

const slugify = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const empty = {
  name: '', title: '', bio: '', avatar_url: '',
  twitter_url: '', linkedin_url: '', website_url: '', slug: '',
}

export default function ManageAuthor() {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabaseAdmin.from('author_profile').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) setForm(data)
        setLoading(false)
      })
  }, [])

  const set = key => e => setForm(p => ({ ...p, [key]: e.target.value }))

  const handleNameChange = e => {
    const name = e.target.value
    setForm(p => ({ ...p, name, slug: p.slug || slugify(name) }))
  }

  const save = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    const { error: err } = await supabaseAdmin.from('author_profile')
      .upsert({ ...form, id: 1, updated_at: new Date().toISOString() })
    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }
    // re-fetch to confirm saved data
    const { data } = await supabaseAdmin.from('author_profile').select('*').eq('id', 1).single()
    if (data) setForm(data)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <div className="flex justify-center py-20"><div className="spinner" /></div>
  )

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Author Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Yeh info public{' '}
          {form.slug && (
            <a href={`/author/${form.slug}`} target="_blank"
               className="underline hover:text-white transition-colors">
              /author/{form.slug}
            </a>
          )}{' '}
          page aur articles ke neeche dikhti hai.
        </p>
      </div>

      {/* Preview card */}
      <div className="admin-card rounded-2xl p-5 mb-8 flex items-center gap-4">
        {form.avatar_url ? (
          <img src={form.avatar_url} alt={form.name}
               className="w-14 h-14 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
               style={{ backgroundColor: 'var(--accent-muted)' }}>
            👨‍💼
          </div>
        )}
        <div>
          <p className="text-white font-bold text-sm">{form.name || 'Author Name'}</p>
          <p className="text-gray-500 text-xs mt-0.5">{form.title || 'Title / Designation'}</p>
          {form.slug && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>/author/{form.slug}</p>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="admin-label">Name *</label>
            <input type="text" value={form.name} onChange={handleNameChange}
                   className="admin-input" placeholder="Prince Pandey" />
          </div>
          <div>
            <label className="admin-label">Slug (URL)</label>
            <input type="text" value={form.slug || ''} onChange={set('slug')}
                   className="admin-input font-mono" placeholder="prince-pandey" />
          </div>
        </div>

        <div>
          <label className="admin-label">Title / Designation</label>
          <input type="text" value={form.title} onChange={set('title')}
                 className="admin-input" placeholder="Performance Marketer" />
        </div>

        <div>
          <label className="admin-label">Bio</label>
          <textarea rows={4} value={form.bio} onChange={set('bio')}
                    className="admin-input resize-none"
                    placeholder="Apne baare mein likho — experience, expertise, passion..." />
        </div>

        <div>
          <label className="admin-label">Avatar / Profile Photo URL</label>
          <input type="text" value={form.avatar_url} onChange={set('avatar_url')}
                 className="admin-input" placeholder="https://..." />
          {form.avatar_url && (
            <img src={form.avatar_url} alt="preview"
                 className="mt-2 w-16 h-16 rounded-full object-cover border-2"
                 style={{ borderColor: 'var(--accent-border)' }}
                 onError={e => e.target.style.display = 'none'} />
          )}
        </div>

        <div className="border-t pt-5" style={{ borderColor: 'var(--admin-border)' }}>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-4">Social Links</p>
          <div className="space-y-4">
            <div>
              <label className="admin-label">LinkedIn URL</label>
              <input type="url" value={form.linkedin_url} onChange={set('linkedin_url')}
                     className="admin-input" placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="admin-label">Twitter / X URL</label>
              <input type="url" value={form.twitter_url} onChange={set('twitter_url')}
                     className="admin-input" placeholder="https://x.com/..." />
            </div>
            <div>
              <label className="admin-label">Website URL</label>
              <input type="url" value={form.website_url} onChange={set('website_url')}
                     className="admin-input" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button onClick={save} disabled={saving}
                  className="btn-admin btn-md disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          {saved && <span className="text-green-400 text-sm font-medium">✓ Saved!</span>}
          {error && <span className="text-red-400 text-sm">{error}</span>}
          {form.slug && (
            <a href={`/author/${form.slug}`} target="_blank"
               className="text-sm text-gray-400 hover:text-white transition-colors underline">
              Preview →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
