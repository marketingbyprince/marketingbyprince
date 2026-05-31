'use client'
import { useEffect, useState } from 'react'
import { supabase as supabaseAdmin } from '@/lib/supabase'

const empty = {
  title: '', slug: '', excerpt: '', content: '', category: '',
  read_time_minutes: '', cover_image_url: '', is_published: false,
}

const slugify = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function ManageArticles() {
  const [articles, setArticles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(empty)
  const [saving,   setSaving]   = useState(false)

  const fetchData = async () => {
    const { data } = await supabaseAdmin.from('articles')
      .select('id, title, slug, category, is_published, published_at')
      .order('created_at', { ascending: false })
    setArticles(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openAdd  = () => { setForm(empty); setEditing('add') }
  const openEdit = async id => {
    const { data } = await supabaseAdmin.from('articles').select('*').eq('id', id).single()
    setForm(data || empty)
    setEditing(id)
  }

  const handleTitleChange = e => {
    const title = e.target.value
    setForm(p => ({ ...p, title, slug: p.slug || slugify(title) }))
  }

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      read_time_minutes: form.read_time_minutes ? Number(form.read_time_minutes) : null,
      published_at: form.is_published && !form.published_at ? new Date().toISOString() : form.published_at,
    }
    if (editing === 'add') {
      await supabaseAdmin.from('articles').insert([payload])
    } else {
      await supabaseAdmin.from('articles').update(payload).eq('id', editing)
    }
    await fetchData()
    setEditing(null)
    setSaving(false)
  }

  const del = async id => {
    if (!confirm('Delete this article?')) return
    await supabaseAdmin.from('articles').delete().eq('id', id)
    setArticles(prev => prev.filter(a => a.id !== id))
  }

  const togglePublish = async (id, val) => {
    const update = { is_published: !val }
    if (!val) update.published_at = new Date().toISOString()
    await supabaseAdmin.from('articles').update(update).eq('id', id)
    setArticles(prev => prev.map(a => a.id === id ? { ...a, ...update } : a))
  }

  if (editing) {
    return (
      <div className="p-6 sm:p-8 max-w-3xl">
        <button onClick={() => setEditing(null)}
                className="text-gray-500 hover:text-white text-sm mb-6 transition-colors font-semibold">
          &larr; Back to Articles
        </button>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-8">
          {editing === 'add' ? 'New Article' : 'Edit Article'}
        </h1>

        <form onSubmit={save} className="space-y-5">
          <div>
            <label className="admin-label">Title *</label>
            <input type="text" required value={form.title}
                   onChange={handleTitleChange} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Slug</label>
            <input type="text" value={form.slug}
                   onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                   className="admin-input font-mono" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="admin-label">Category</label>
              <input type="text" value={form.category}
                     onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                     className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Read Time (minutes)</label>
              <input type="number" value={form.read_time_minutes}
                     onChange={e => setForm(p => ({ ...p, read_time_minutes: e.target.value }))}
                     className="admin-input" />
            </div>
          </div>
          <div>
            <label className="admin-label">Cover Image URL</label>
            <input type="url" value={form.cover_image_url}
                   onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))}
                   className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Excerpt</label>
            <textarea rows={2} value={form.excerpt}
                      onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                      className="admin-input resize-none" />
          </div>
          <div>
            <label className="admin-label">Content (Markdown / plain text)</label>
            <textarea rows={16} value={form.content}
                      onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                      placeholder="Write your article here..."
                      className="admin-input resize-y font-mono text-xs" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published}
                   onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} />
            <span className="text-sm text-gray-300 font-medium">Publish immediately</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
                    className="btn-admin btn-md disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Article'}
            </button>
            <button type="button" onClick={() => setEditing(null)}
                    className="btn btn-md border border-gray-700 text-gray-300 hover:border-gray-600">
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
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Articles</h1>
        <button onClick={openAdd} className="btn-admin btn-sm">+ New Article</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-sm">No articles yet.</div>
      ) : (
        <div className="space-y-2">
          {articles.map(a => (
            <div key={a.id}
                 className="flex items-center justify-between admin-card rounded-xl px-5 py-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{a.title}</p>
                <p className="text-gray-500 text-xs">{a.category || 'No category'} &middot; {a.slug}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => togglePublish(a.id, a.is_published)}
                        className={`text-xs px-2.5 py-1 rounded-full transition-colors ${a.is_published ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                  {a.is_published ? 'Published' : 'Draft'}
                </button>
                <button onClick={() => openEdit(a.id)}
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
