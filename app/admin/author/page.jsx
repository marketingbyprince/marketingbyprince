'use client'
import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabase'

const slugify = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const empty = {
  name: '', title: '', bio: '', avatar_url: '',
  twitter_url: '', linkedin_url: '', website_url: '', slug: '',
}

export default function ManageAuthors() {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = list, 'add' = new, id = edit
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const fetchAuthors = async () => {
    const { data } = await supabaseAdmin.from('author_profile').select('*').order('id')
    setAuthors(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchAuthors() }, [])

  const openAdd = () => { setForm(empty); setError(''); setSaved(false); setEditing('add') }
  const openEdit = (author) => { setForm(author); setError(''); setSaved(false); setEditing(author.id) }

  const set = key => e => setForm(p => ({ ...p, [key]: e.target.value }))
  const handleNameChange = e => {
    const name = e.target.value
    setForm(p => ({ ...p, name, slug: p.slug || slugify(name) }))
  }

  const save = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.slug.trim()) { setError('Slug is required.'); return }
    setSaving(true)
    setSaved(false)
    setError('')

    let err
    if (editing === 'add') {
      const { error: e } = await supabaseAdmin.from('author_profile')
        .insert([{ ...form, updated_at: new Date().toISOString() }])
      err = e
    } else {
      const { error: e } = await supabaseAdmin.from('author_profile')
        .update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing)
      err = e
    }

    if (err) { setError(err.message); setSaving(false); return }
    await fetchAuthors()
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setEditing(null) }, 1200)
  }

  const del = async (id) => {
    if (!confirm('Delete this author? This cannot be undone.')) return
    await supabaseAdmin.from('author_profile').delete().eq('id', id)
    setAuthors(prev => prev.filter(a => a.id !== id))
  }

  // ── Form view ─────────────────────────────────────────────────────────────
  if (editing !== null) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl">
        <button onClick={() => setEditing(null)}
                className="text-gray-500 hover:text-white text-sm mb-6 transition-colors font-semibold">
          &larr; Back to Authors
        </button>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-8">
          {editing === 'add' ? 'New Author' : 'Edit Author'}
        </h1>

        {/* Preview card */}
        <div className="admin-card rounded-2xl p-5 mb-8 flex items-center gap-4">
          {form.avatar_url ? (
            <img src={form.avatar_url} alt={form.name}
                 className="w-14 h-14 rounded-full object-cover shrink-0"
                 onError={e => { e.target.style.display = 'none' }} />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
                 style={{ backgroundColor: 'var(--accent-muted)' }}>👨‍💼</div>
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
                     className="admin-input" placeholder="e.g. Prince Pandey" />
            </div>
            <div>
              <label className="admin-label">Slug (URL) *</label>
              <input type="text" value={form.slug || ''} onChange={set('slug')}
                     className="admin-input font-mono" placeholder="prince-pandey" />
            </div>
          </div>

          <div>
            <label className="admin-label">Title / Designation</label>
            <input type="text" value={form.title} onChange={set('title')}
                   className="admin-input" placeholder="e.g. Performance Marketer" />
          </div>

          <div>
            <label className="admin-label">Bio</label>
            <textarea rows={4} value={form.bio} onChange={set('bio')}
                      className="admin-input resize-none"
                      placeholder="Write a short bio about this author..." />
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
                <input type="text" value={form.linkedin_url} onChange={set('linkedin_url')}
                       className="admin-input" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="admin-label">Twitter / X URL</label>
                <input type="text" value={form.twitter_url} onChange={set('twitter_url')}
                       className="admin-input" placeholder="https://x.com/..." />
              </div>
              <div>
                <label className="admin-label">Website URL</label>
                <input type="text" value={form.website_url} onChange={set('website_url')}
                       className="admin-input" placeholder="https://..." />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button onClick={save} disabled={saving}
                    className="btn-admin btn-md disabled:opacity-60">
              {saving ? 'Saving…' : editing === 'add' ? 'Create Author' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setEditing(null)}
                    className="btn btn-md border border-gray-700 text-gray-300 hover:border-gray-600">
              Cancel
            </button>
            {saved && <span className="text-green-400 text-sm font-medium">✓ Saved!</span>}
            {error && <span className="text-red-400 text-sm">{error}</span>}
            {form.slug && editing !== 'add' && (
              <a href={`/author/${form.slug}`} target="_blank"
                 className="text-sm text-gray-400 hover:text-white transition-colors underline ml-auto">
                Preview →
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Authors</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage author profiles. Each author gets a public page at <span style={{ color: 'var(--accent)' }}>/author/[slug]</span>.
          </p>
        </div>
        <button onClick={openAdd} className="btn-admin btn-sm">+ New Author</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : authors.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-sm">No authors yet.</div>
      ) : (
        <div className="space-y-3">
          {authors.map(a => (
            <div key={a.id}
                 className="flex items-center gap-4 admin-card rounded-xl px-5 py-4">
              {a.avatar_url ? (
                <img src={a.avatar_url} alt={a.name}
                     className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                     style={{ backgroundColor: 'var(--accent-muted)' }}>👨‍💼</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{a.name}</p>
                <p className="text-gray-500 text-xs">{a.title || 'No title'} · /author/{a.slug}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={`/author/${a.slug}`} target="_blank"
                   className="text-gray-400 hover:text-white text-xs px-3 py-1 rounded-lg hover:bg-white/5 transition-colors">
                  View
                </a>
                <button onClick={() => openEdit(a)}
                        className="text-gray-400 hover:text-white text-xs px-3 py-1 rounded-lg hover:bg-white/5 transition-colors">
                  Edit
                </button>
                <button onClick={() => del(a.id)}
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
