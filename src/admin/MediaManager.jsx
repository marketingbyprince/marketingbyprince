import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import AdminLayout from './AdminLayout'

const BUCKET = 'website-assets'

function getPublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function SeoScore({ meta }) {
  const filled = [meta.alt_text, meta.slug, meta.title_tag].filter(Boolean).length
  const color  = filled === 3 ? '#22c55e' : filled >= 1 ? '#f59e0b' : '#6b7280'
  const label  = filled === 3 ? 'SEO Good' : filled >= 1 ? 'SEO Partial' : 'SEO Missing'
  return (
    <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40` }}>
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
      <span className="text-xs ml-auto" style={{ color: '#6b7280' }}>{filled}/3 fields</span>
    </div>
  )
}

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-bold text-white shadow-xl"
         style={{ backgroundColor: 'var(--accent)' }}>
      {msg}
    </div>
  )
}

export default function MediaManager() {
  const [folders,     setFolders]     = useState([])
  const [activeFolder,setActiveFolder]= useState('')
  const [images,      setImages]      = useState([])
  const [metadata,    setMetadata]    = useState({})  // storage_path → row
  const [loading,     setLoading]     = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [drawer,      setDrawer]      = useState(null) // image object | null
  const [drawerMeta,  setDrawerMeta]  = useState({})
  const [savingMeta,  setSavingMeta]  = useState(false)
  const [deleteTarget,setDeleteTarget]= useState(null)
  const [deleting,    setDeleting]    = useState(false)
  const [toast,       setToast]       = useState(null)
  const [newFolder,   setNewFolder]   = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)
  const fileInputRef = useRef()

  // ── Load folders ──────────────────────────────────────────────────
  const loadFolders = useCallback(async () => {
    const { data } = await supabase.storage.from(BUCKET).list('', { limit: 200 })
    const dirs = (data || []).filter(f => !f.metadata).map(f => f.name)
    setFolders(dirs)
    if (dirs.length && !activeFolder) setActiveFolder(dirs[0])
  }, [activeFolder])

  useEffect(() => { loadFolders() }, [])

  // ── Load images for active folder ─────────────────────────────────
  const loadImages = useCallback(async () => {
    if (activeFolder === undefined) return
    setLoading(true)
    const prefix = activeFolder ? `${activeFolder}/` : ''
    const { data } = await supabase.storage.from(BUCKET).list(activeFolder || '', { limit: 500 })
    const files = (data || []).filter(f => f.metadata)
    setImages(files.map(f => ({ ...f, path: prefix + f.name })))

    if (files.length) {
      const paths = files.map(f => prefix + f.name)
      const { data: rows } = await supabase
        .from('image_metadata').select('*').in('storage_path', paths)
      const map = {}
      ;(rows || []).forEach(r => { map[r.storage_path] = r })
      setMetadata(map)
    } else {
      setMetadata({})
    }
    setLoading(false)
  }, [activeFolder])

  useEffect(() => { loadImages() }, [loadImages])

  // ── Upload ────────────────────────────────────────────────────────
  const handleUpload = async e => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    await Promise.all(files.map(file => {
      const path = activeFolder ? `${activeFolder}/${file.name}` : file.name
      return supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    }))
    await loadImages()
    setUploading(false)
    setToast(`${files.length} file${files.length > 1 ? 's' : ''} uploaded`)
    e.target.value = ''
  }

  // ── Create folder ─────────────────────────────────────────────────
  const createFolder = async () => {
    const name = newFolder.trim().replace(/\s+/g, '-').toLowerCase()
    if (!name) return
    await supabase.storage.from(BUCKET).upload(`${name}/.keep`, new Blob(['']))
    setNewFolder('')
    setShowFolderInput(false)
    await loadFolders()
    setActiveFolder(name)
  }

  // ── Copy URL ──────────────────────────────────────────────────────
  const copyUrl = async path => {
    await navigator.clipboard.writeText(getPublicUrl(path))
    setToast('URL copied!')
  }

  // ── Open drawer ───────────────────────────────────────────────────
  const openDrawer = img => {
    setDrawer(img)
    const m = metadata[img.path] || {}
    setDrawerMeta({
      slug:       m.slug       || '',
      alt_text:   m.alt_text   || '',
      title_tag:  m.title_tag  || '',
      caption:    m.caption    || '',
      folder:     m.folder     || activeFolder,
    })
  }

  // ── Save metadata ─────────────────────────────────────────────────
  const saveMeta = async () => {
    if (!drawer) return
    setSavingMeta(true)
    const existing = metadata[drawer.path]
    const payload = {
      storage_path: drawer.path,
      slug:       drawerMeta.slug      || null,
      alt_text:   drawerMeta.alt_text  || null,
      title_tag:  drawerMeta.title_tag || null,
      caption:    drawerMeta.caption   || null,
      folder:     drawerMeta.folder    || null,
    }

    if (existing) {
      await supabase.from('image_metadata').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('image_metadata').insert([payload])
    }

    // Move file if folder changed
    if (drawerMeta.folder !== activeFolder) {
      const newPath = `${drawerMeta.folder}/${drawer.name}`
      await supabase.storage.from(BUCKET).move(drawer.path, newPath)
      await loadImages()
      setDrawer(null)
    } else {
      await loadImages()
    }

    setSavingMeta(false)
    setToast('Metadata saved')
  }

  // ── Delete ────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.storage.from(BUCKET).remove([deleteTarget.path])
    await supabase.from('image_metadata').delete().eq('storage_path', deleteTarget.path)
    await loadImages()
    setDeleting(false)
    setDeleteTarget(null)
    if (drawer?.path === deleteTarget.path) setDrawer(null)
    setToast('File deleted')
  }

  const isImage = name => /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(name)

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Media</h1>
            <p className="text-gray-400 text-sm mt-1">{images.length} files in this folder</p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} accept="image/*,video/*,.pdf,.svg" />
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="btn-admin btn-sm disabled:opacity-60"
            >
              {uploading ? 'Uploading…' : '↑ Upload'}
            </button>
          </div>
        </div>

        {/* ── Folder tabs ────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {folders.map(f => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                activeFolder === f
                  ? 'text-white border-transparent'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
              }`}
              style={activeFolder === f ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
            >
              {f}
            </button>
          ))}

          {showFolderInput ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={newFolder}
                onChange={e => setNewFolder(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowFolderInput(false) }}
                placeholder="folder-name"
                className="admin-input py-1 text-sm w-36"
              />
              <button onClick={createFolder} className="btn-admin btn-sm">Create</button>
              <button onClick={() => setShowFolderInput(false)} className="text-gray-500 hover:text-white text-sm">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setShowFolderInput(true)}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-gray-500 border border-dashed border-gray-700 hover:border-gray-500 hover:text-white transition-all"
            >
              + New Folder
            </button>
          )}
        </div>

        {/* ── Image grid ─────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm">
            <p className="text-4xl mb-3">🖼️</p>
            <p>No files in this folder. Upload some!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map(img => {
              const url  = getPublicUrl(img.path)
              const meta = metadata[img.path]
              const hasMeta = !!(meta?.alt_text && meta?.slug && meta?.title_tag)
              return (
                <div
                  key={img.path}
                  className="admin-card rounded-xl overflow-hidden group relative"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-black/20 relative overflow-hidden">
                    {isImage(img.name) ? (
                      <img
                        src={url}
                        alt={meta?.alt_text || img.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {/\.pdf/i.test(img.name) ? '📄' : /\.svg/i.test(img.name) ? '✦' : '📁'}
                      </div>
                    )}

                    {/* SEO dot */}
                    <span
                      className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-black/30"
                      style={{ backgroundColor: hasMeta ? '#22c55e' : '#6b7280' }}
                      title={hasMeta ? 'SEO complete' : 'SEO incomplete'}
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => copyUrl(img.path)}
                        title="Copy URL"
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors"
                      >
                        🔗
                      </button>
                      <button
                        onClick={() => openDrawer(img)}
                        title="Edit metadata"
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteTarget(img)}
                        title="Delete"
                        className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 text-sm transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Filename */}
                  <div className="px-2.5 py-2">
                    <p className="text-xs text-gray-400 truncate font-medium">{img.name}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Edit Drawer ─────────────────────────────────────────────── */}
      {drawer && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setDrawer(null)}
          />
          {/* Drawer */}
          <div
            className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--admin-surface)', borderLeft: '1px solid var(--admin-border)' }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <h3 className="text-white font-extrabold text-sm truncate pr-4">{drawer.name}</h3>
              <button onClick={() => setDrawer(null)} className="text-gray-500 hover:text-white text-xl leading-none shrink-0">✕</button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Preview */}
              {isImage(drawer.name) && (
                <div className="rounded-xl overflow-hidden aspect-video bg-black/20">
                  <img src={getPublicUrl(drawer.path)} alt={drawer.name} className="w-full h-full object-contain" />
                </div>
              )}

              {/* Public URL */}
              <div>
                <label className="admin-label">Public URL</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={getPublicUrl(drawer.path)}
                    className="admin-input text-xs flex-1 cursor-text"
                  />
                  <button
                    onClick={() => copyUrl(drawer.path)}
                    className="btn-admin btn-sm shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* SEO score */}
              <SeoScore meta={drawerMeta} />

              {/* Metadata fields */}
              <div className="space-y-4">
                <div>
                  <label className="admin-label">Slug <span className="text-gray-600 font-normal normal-case">(SEO URL)</span></label>
                  <input
                    type="text"
                    value={drawerMeta.slug}
                    onChange={e => setDrawerMeta(p => ({ ...p, slug: e.target.value }))}
                    placeholder="my-image-name"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Alt Text</label>
                  <input
                    type="text"
                    value={drawerMeta.alt_text}
                    onChange={e => setDrawerMeta(p => ({ ...p, alt_text: e.target.value }))}
                    placeholder="Describe the image for screen readers"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Title Tag</label>
                  <input
                    type="text"
                    value={drawerMeta.title_tag}
                    onChange={e => setDrawerMeta(p => ({ ...p, title_tag: e.target.value }))}
                    placeholder="Image title"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Caption</label>
                  <textarea
                    rows={3}
                    value={drawerMeta.caption}
                    onChange={e => setDrawerMeta(p => ({ ...p, caption: e.target.value }))}
                    placeholder="Optional caption text"
                    className="admin-input resize-none"
                  />
                </div>
                <div>
                  <label className="admin-label">Move to Folder</label>
                  <select
                    value={drawerMeta.folder}
                    onChange={e => setDrawerMeta(p => ({ ...p, folder: e.target.value }))}
                    className="admin-input"
                  >
                    {folders.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Drawer footer */}
            <div className="p-5 border-t flex gap-3" style={{ borderColor: 'var(--admin-border)' }}>
              <button
                onClick={saveMeta}
                disabled={savingMeta}
                className="flex-1 btn-admin btn-md disabled:opacity-60"
              >
                {savingMeta ? 'Saving…' : 'Save Metadata'}
              </button>
              <button
                onClick={() => setDeleteTarget(drawer)}
                className="px-4 py-2 rounded-xl text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors text-sm font-bold"
              >
                🗑️
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirmation modal ────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="admin-card rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-extrabold text-lg mb-2">Delete File?</h3>
            <p className="text-gray-400 text-sm mb-6">
              <span className="text-white font-semibold">{deleteTarget.name}</span> will be permanently deleted and cannot be recovered.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-700 text-gray-300 hover:border-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────── */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </AdminLayout>
  )
}