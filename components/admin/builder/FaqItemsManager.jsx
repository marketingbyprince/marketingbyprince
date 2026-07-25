'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const empty = { question: '', answer: '' }

// Manages the individual Q&A rows (public.faqs) attached to a page, used by
// any `faq_accordion` section on that page.
export default function FaqItemsManager({ pageId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('faqs').select('*').eq('page_id', pageId).order('sort_order')
    setItems(data || [])
    setLoading(false)
  }, [pageId])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setForm(empty); setEditingId('new') }
  const openEdit = (item) => { setForm({ question: item.question, answer: item.answer }); setEditingId(item.id) }
  const cancel = () => { setEditingId(null); setForm(empty) }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    if (editingId === 'new') {
      await supabase.from('faqs').insert([{ ...form, page_id: pageId, sort_order: items.length }])
    } else {
      await supabase.from('faqs').update(form).eq('id', editingId)
    }
    setSaving(false)
    cancel()
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete this FAQ?')) return
    await supabase.from('faqs').delete().eq('id', id)
    load()
  }

  const toggleActive = async (item) => {
    await supabase.from('faqs').update({ is_active: !item.is_active }).eq('id', item.id)
    load()
  }

  const move = async (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const a = items[i], b = items[j]
    await supabase.from('faqs').update({ sort_order: b.sort_order }).eq('id', a.id)
    await supabase.from('faqs').update({ sort_order: a.sort_order }).eq('id', b.id)
    load()
  }

  return (
    <div className="mt-3 pl-4 border-l-2" style={{ borderColor: 'var(--admin-border)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">FAQ Items</p>
        <button onClick={openAdd} className="text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--accent)' }}>
          + Add Item
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-gray-500">Loading…</p>
      ) : items.length === 0 && editingId === null ? (
        <p className="text-xs text-gray-500">No FAQ items yet.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2 admin-card rounded-lg px-3 py-2">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-500 hover:text-white disabled:opacity-20 text-[10px] leading-none">▲</button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20 text-[10px] leading-none">▼</button>
              </div>
              <p className="flex-1 min-w-0 text-xs text-gray-200 truncate">{item.question}</p>
              <button onClick={() => toggleActive(item)} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                {item.is_active ? 'Active' : 'Off'}
              </button>
              <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-white text-xs px-2 py-1">Edit</button>
              <button onClick={() => remove(item.id)} className="text-gray-500 hover:text-red-400 text-xs px-2 py-1">Del</button>
            </div>
          ))}
        </div>
      )}

      {editingId !== null && (
        <form onSubmit={save} className="admin-card rounded-lg p-3 mt-2 space-y-2">
          <div>
            <label className="admin-label">Question</label>
            <input required value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Answer</label>
            <textarea required rows={2} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} className="admin-input resize-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-admin btn-sm disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={cancel} className="btn btn-sm border text-gray-300" style={{ borderColor: 'var(--admin-border)' }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
