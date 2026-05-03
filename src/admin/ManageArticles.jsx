import { useEffect, useState } from 'react'
import { supabaseAdmin } from '../lib/supabase'
import AdminLayout from './AdminLayout'

const empty = { title: '', slug: '', excerpt: '', content: '', category: '', read_time_minutes: '', cover_image_url: '', is_published: false }

const slugify = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function ManageArticles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabaseAdmin.from('articles').select('id, title, slug, category, is_published, published_at').order('created_at', { ascending: false })
    setArticles(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const openAdd = () => { setForm(empty); setEditing('add') }
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
    await fetch()
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
      <AdminLayout>
        <div className="p-6 sm:p-8 max-w-3xl">
          <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">
            ← Back to Articles
          </button>
          <h1 className="text-2xl font-bold text-white mb-8">{editing === 'add' ? 'New Article' : 'Edit Article'}</h1>

          <form onSubmit={save} className="space-y-5">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Title *</label>
              <input type="text" required value={form.title} onChange={handleTitleChange}
                className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 font-mono" />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Category</label>
                <input type="text" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Read Time (minutes)</label>
                <input type="number" value={form.read_time_minutes} onChange={e => setForm(p => ({ ...p, read_time_minutes: e.target.value }))}
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Cover Image URL</label>
              <input type="url" value={form.cover_image_url} onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))}
                className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Excerpt</label>
              <textarea rows={2} value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Content (Markdown / plain text)</label>
              <textarea rows={16} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="Write your article here..."
                className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-y font-mono" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} />
              <span className="text-sm text-gray-300">Publish immediately</span>
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Article'}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="px-6 py-2.5 border border-gray-700 text-gray-300 rounded-xl text-sm transition-colors hover:border-gray-600">
                Cancel
              </button>
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
          <h1 className="text-2xl font-bold text-white">Articles</h1>
          <button onClick={openAdd} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
            + New Article
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No articles yet.</div>
        ) : (
          <div className="space-y-2">
            {articles.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-xl px-5 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{a.title}</p>
                  <p className="text-gray-500 text-xs">{a.category || 'No category'} · {a.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => togglePublish(a.id, a.is_published)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors ${a.is_published ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                    {a.is_published ? 'Published' : 'Draft'}
                  </button>
                  <button onClick={() => openEdit(a.id)} className="text-gray-400 hover:text-white text-xs px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors">Edit</button>
                  <button onClick={() => del(a.id)} className="text-gray-500 hover:text-red-400 text-xs px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors">Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
