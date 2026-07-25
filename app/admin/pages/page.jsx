'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminPageShell from '@/components/admin/AdminPageShell'
import RecordRow from '@/components/admin/RecordRow'
import CrudModal from '@/components/admin/CrudModal'
import FieldGroup from '@/components/admin/FieldGroup'
import SectionsManager from '@/components/admin/builder/SectionsManager'

const emptyPage = { slug: '', title: '', template: 'default' }

const NEW_PAGE_FIELDS = [
  { name: 'title', label: 'Page Title', required: true, placeholder: 'Privacy Policy' },
  { name: 'slug', label: 'URL Slug', required: true, placeholder: 'privacy-policy', hint: 'Used as /slug — lowercase, hyphenated' },
]

export default function ManagePages() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(emptyPage)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('pages').select('*').order('created_at', { ascending: false })
    setPages(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setForm(emptyPage); setError(''); setAddOpen(true) }

  const createPage = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const slug = form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
    const { data, error: err } = await supabase
      .from('pages')
      .insert([{ title: form.title, slug, template: 'default', status: 'draft' }])
      .select()
      .single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setAddOpen(false)
    await load()
    setEditingId(data.id)
  }

  const togglePublish = async (page) => {
    await supabase.from('pages').update({
      status: page.status === 'published' ? 'draft' : 'published',
      updated_at: new Date().toISOString(),
    }).eq('id', page.id)
    load()
  }

  const remove = async (page) => {
    if (!confirm(`Delete "${page.title}" and all its sections? This cannot be undone.`)) return
    await supabase.from('pages').delete().eq('id', page.id)
    load()
  }

  const editing = pages.find(p => p.id === editingId)

  if (editing) {
    return <PageEditor page={editing} onBack={() => { setEditingId(null); load() }} onChanged={load} />
  }

  return (
    <AdminPageShell
      title="Pages"
      count={pages.length}
      action={<button onClick={openAdd} className="btn-admin btn-sm">+ Add Page</button>}
    >
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : pages.length === 0 ? (
        <p className="text-sm text-gray-500 admin-card rounded-xl px-5 py-8 text-center">
          No pages yet. Every page you add here is built from reorderable sections and is fully editable — nothing is hardcoded.
        </p>
      ) : (
        <div className="space-y-2">
          {pages.map(p => (
            <RecordRow
              key={p.id}
              icon="📄"
              title={p.title}
              subtitle={`/${p.slug}`}
              isActive={p.status === 'published'}
              onToggle={() => togglePublish(p)}
              onEdit={() => setEditingId(p.id)}
              onDelete={() => remove(p)}
            />
          ))}
        </div>
      )}

      <CrudModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={createPage}
        saving={saving}
        error={error}
        title="Add Page"
        submitLabel="Create & Build Sections"
      >
        <FieldGroup fields={NEW_PAGE_FIELDS} form={form} onChange={(name, val) => setForm(f => ({ ...f, [name]: val }))} />
      </CrudModal>
    </AdminPageShell>
  )
}

function PageEditor({ page, onBack, onChanged }) {
  const [form, setForm] = useState({ title: page.title, slug: page.slug, status: page.status })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    const slug = form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
    await supabase.from('pages').update({ title: form.title, slug, status: form.status, updated_at: new Date().toISOString() }).eq('id', page.id)
    setSaving(false)
    setSaved(true)
    onChanged()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 sm:p-8">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1.5">
        ← Back to Pages
      </button>

      <form onSubmit={save} className="admin-card rounded-xl p-5 mb-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-extrabold text-white tracking-tight">{page.title}</h1>
          <div className="flex items-center gap-2">
            <Link href={`/admin/pages/preview/${page.slug}`} target="_blank" className="btn btn-sm border text-gray-300 hover:text-white" style={{ borderColor: 'var(--admin-border)' }}>
              Preview
            </Link>
            <button type="submit" disabled={saving} className="btn-admin btn-sm disabled:opacity-60">
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="admin-label">Title</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Slug</label>
            <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="admin-input" />
          </div>
        </div>
        <div>
          <label className="admin-label">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="admin-input max-w-xs">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </form>

      <div className="admin-card rounded-xl p-5">
        <SectionsManager pageId={page.id} />
      </div>
    </div>
  )
}
