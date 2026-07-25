'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import CrudModal from '@/components/admin/CrudModal'
import FieldGroup from '@/components/admin/FieldGroup'
import RichTextEditor from '@/components/admin/RichTextEditor'
import FaqItemsManager from './FaqItemsManager'
import { SECTION_TYPE_META, SECTION_TYPES } from './sectionTypeMeta'

export default function SectionsManager({ pageId }) {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [picking, setPicking] = useState(false)
  const [modal, setModal] = useState(null) // { mode: 'add'|'edit', type, section? }
  const [form, setForm] = useState({})
  const [html, setHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('page_sections').select('*').eq('page_id', pageId).order('sort_order')
    setSections(data || [])
    setLoading(false)
  }, [pageId])

  useEffect(() => { load() }, [load])

  const openAdd = (type) => {
    setPicking(false)
    setForm({})
    setHtml('')
    setModal({ mode: 'add', type })
  }

  const openEdit = (section) => {
    const { html: h, ...rest } = section.content || {}
    const meta = SECTION_TYPE_META[section.section_type]
    const stringified = { ...rest }
    ;(meta?.jsonFields || []).forEach((key) => {
      if (rest[key] !== undefined) stringified[key] = JSON.stringify(rest[key], null, 2)
    })
    setForm({ adminTitle: section.title || '', ...stringified })
    setHtml(h || '')
    setModal({ mode: 'edit', type: section.section_type, section })
  }

  const closeModal = () => setModal(null)

  const save = async (e) => {
    e.preventDefault()
    const { adminTitle, ...content } = form
    const meta = SECTION_TYPE_META[modal.type]

    for (const key of meta.jsonFields || []) {
      if (!content[key]) { delete content[key]; continue }
      try {
        content[key] = JSON.parse(content[key])
      } catch {
        alert(`"${key}" isn't valid JSON — fix it before saving.`)
        return
      }
    }

    setSaving(true)
    if (meta.hasHtmlField) content.html = html

    if (modal.mode === 'add') {
      const maxOrder = sections.reduce((m, s) => Math.max(m, s.sort_order), -1)
      await supabase.from('page_sections').insert([{
        page_id: pageId, section_type: modal.type, title: adminTitle || null,
        content, sort_order: maxOrder + 1, is_visible: true,
      }])
    } else {
      await supabase.from('page_sections').update({
        title: adminTitle || null, content, updated_at: new Date().toISOString(),
      }).eq('id', modal.section.id)
    }
    setSaving(false)
    closeModal()
    load()
  }

  const remove = async (section) => {
    if (!confirm(`Delete this ${SECTION_TYPE_META[section.section_type]?.label || 'section'}?`)) return
    await supabase.from('page_sections').delete().eq('id', section.id)
    load()
  }

  const duplicate = async (section) => {
    const maxOrder = sections.reduce((m, s) => Math.max(m, s.sort_order), -1)
    await supabase.from('page_sections').insert([{
      page_id: pageId,
      section_type: section.section_type,
      title: section.title ? `${section.title} (copy)` : null,
      content: section.content,
      sort_order: maxOrder + 1,
      is_visible: section.is_visible,
    }])
    load()
  }

  const toggleVisible = async (section) => {
    await supabase.from('page_sections').update({ is_visible: !section.is_visible }).eq('id', section.id)
    load()
  }

  const move = async (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= sections.length) return
    const a = sections[i], b = sections[j]
    await supabase.from('page_sections').update({ sort_order: b.sort_order }).eq('id', a.id)
    await supabase.from('page_sections').update({ sort_order: a.sort_order }).eq('id', b.id)
    load()
  }

  const activeMeta = modal ? SECTION_TYPE_META[modal.type] : null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm">Sections</h3>
        <div className="relative">
          <button onClick={() => setPicking(p => !p)} className="btn-admin btn-sm">+ Add Section</button>
          {picking && (
            <div className="absolute right-0 mt-2 z-20 admin-card rounded-xl p-2 w-56 shadow-xl">
              {SECTION_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => openAdd(type)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/5 transition-colors text-left"
                >
                  <span>{SECTION_TYPE_META[type].icon}</span> {SECTION_TYPE_META[type].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner" /></div>
      ) : sections.length === 0 ? (
        <p className="text-sm text-gray-500 admin-card rounded-xl px-5 py-6 text-center">
          No sections yet. Click "+ Add Section" to build this page.
        </p>
      ) : (
        <div className="space-y-2">
          {sections.map((s, i) => {
            const meta = SECTION_TYPE_META[s.section_type]
            const isOpen = expanded === s.id
            return (
              <div key={s.id} className="admin-card rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-500 hover:text-white disabled:opacity-20 text-[10px] leading-none">▲</button>
                    <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20 text-[10px] leading-none">▼</button>
                  </div>
                  <span className="text-lg shrink-0">{meta?.icon || '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{s.title || meta?.label || s.section_type}</p>
                    <p className="text-xs text-gray-500">{meta?.label || s.section_type}</p>
                  </div>
                  <button
                    onClick={() => toggleVisible(s)}
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${s.is_visible ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                  >
                    {s.is_visible ? 'Visible' : 'Hidden'}
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/5 font-semibold">Edit</button>
                    <button onClick={() => duplicate(s)} className="text-gray-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/5 font-semibold">Duplicate</button>
                    <button onClick={() => remove(s)} className="text-gray-500 hover:text-red-400 text-xs px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 font-semibold">Del</button>
                    {meta?.hasFaqItems && (
                      <button onClick={() => setExpanded(isOpen ? null : s.id)} className="text-gray-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/5 font-semibold">
                        {isOpen ? 'Hide FAQs' : 'FAQs'}
                      </button>
                    )}
                  </div>
                </div>
                {meta?.hasFaqItems && isOpen && (
                  <div className="px-4 pb-4">
                    <FaqItemsManager pageId={pageId} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modal && activeMeta && (
        <CrudModal
          open
          onClose={closeModal}
          onSubmit={save}
          saving={saving}
          size="lg"
          title={`${modal.mode === 'add' ? 'Add' : 'Edit'} ${activeMeta.label} Section`}
        >
          {activeMeta.note && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-muted)' }}>
              ℹ️ {activeMeta.note}
            </p>
          )}
          <FieldGroup
            fields={[{ name: 'adminTitle', label: 'Admin Label (internal, optional)', hint: 'Helps you tell sections apart in this list' }]}
            form={form}
            onChange={(name, val) => setForm(f => ({ ...f, [name]: val }))}
          />
          <FieldGroup
            fields={activeMeta.fields}
            form={form}
            onChange={(name, val) => setForm(f => ({ ...f, [name]: val }))}
          />
          {activeMeta.hasHtmlField && (
            <div>
              <label className="admin-label">Content</label>
              <RichTextEditor value={html} onChange={setHtml} minHeight={200} />
            </div>
          )}
        </CrudModal>
      )}
    </div>
  )
}
