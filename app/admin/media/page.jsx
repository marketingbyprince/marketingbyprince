'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const BUCKET = 'website-assets'

function getPublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

const slugify = str =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function autoSlug(folder, filename) {
  const nameNoExt = filename.replace(/\.[^/.]+$/, '')
  const s = slugify(nameNoExt)
  return folder ? `${slugify(folder)}/${s}` : s
}

function updateSlugOnMove(currentSlug, oldFolder, newFolder, filename) {
  const nameNoExt = filename.replace(/\.[^/.]+$/, '')
  const s = slugify(nameNoExt)
  const oldAuto = oldFolder ? `${slugify(oldFolder)}/${s}` : s
  if (!currentSlug || currentSlug === oldAuto) {
    return newFolder ? `${slugify(newFolder)}/${s}` : s
  }
  return currentSlug
}

const EXT_ICONS = [
  [/\.(jpe?g|png|webp|gif|avif)$/i, '🖼️'],
  [/\.svg$/i,                        '⬡'],
  [/\.pdf$/i,                        '📄'],
  [/\.(mp4|mov|avi|webm|mkv)$/i,    '🎬'],
  [/\.(mp3|wav|ogg|flac|aac)$/i,    '🎵'],
  [/\.(doc|docx)$/i,                 '📝'],
  [/\.(xls|xlsx|csv)$/i,             '📊'],
  [/\.(ppt|pptx)$/i,                 '📑'],
  [/\.(zip|rar|tar|gz|7z)$/i,        '🗜️'],
  [/\.(js|ts|jsx|tsx|json|html|css|py|rb|php|sh)$/i, '💻'],
  [/\.(txt|md|log)$/i,               '📋'],
]

function fileIcon(name) {
  for (const [re, icon] of EXT_ICONS) if (re.test(name)) return icon
  return '📁'
}

function isImage(name) { return /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(name) }

function fileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function SeoScore({ meta }) {
  const filled = [meta.alt_text, meta.slug, meta.title_tag].filter(Boolean).length
  const color  = filled === 3 ? '#22c55e' : filled >= 1 ? '#f59e0b' : '#6b7280'
  const label  = filled === 3 ? 'SEO Good' : filled >= 1 ? 'SEO Partial' : 'SEO Missing'
  return (
    <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg"
         style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40` }}>
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

export default function FileManager() {
  const [folders,          setFolders]          = useState([])
  const [activeFolder,     setActiveFolder]      = useState('')
  const [files,            setFiles]             = useState([])
  const [metadata,         setMetadata]          = useState({})
  const [loading,          setLoading]           = useState(false)
  const [uploading,        setUploading]         = useState(false)
  const [drawer,           setDrawer]            = useState(null)
  const [drawerMeta,       setDrawerMeta]        = useState({})
  const [savingMeta,       setSavingMeta]        = useState(false)
  const [deleteTarget,     setDeleteTarget]      = useState(null)
  const [deleting,         setDeleting]          = useState(false)
  const [toast,            setToast]             = useState(null)
  const [newFolder,        setNewFolder]         = useState('')
  const [showFolderInput,  setShowFolderInput]   = useState(false)
  const [renamingFolder,   setRenamingFolder]    = useState(null)
  const [renameValue,      setRenameValue]       = useState('')
  const [viewMode,         setViewMode]          = useState('grid') // 'grid' | 'list'
  const fileInputRef = useRef()

  // ── Load folders ───────────────────────────────────────────────────
  const loadFolders = useCallback(async () => {
    const { data } = await supabase.storage.from(BUCKET).list('', { limit: 200 })
    const dirs = (data || []).filter(f => !f.metadata).map(f => f.name)
    setFolders(dirs)
    if (dirs.length && !activeFolder) setActiveFolder(dirs[0])
  }, [activeFolder])

  useEffect(() => { loadFolders() }, [])

  // ── Load files for active folder ───────────────────────────────────
  const loadFiles = useCallback(async () => {
    if (activeFolder === undefined) return
    setLoading(true)
    const prefix = activeFolder ? `${activeFolder}/` : ''
    const { data } = await supabase.storage.from(BUCKET).list(activeFolder || '', { limit: 500 })
    const items = (data || []).filter(f => f.metadata)
    setFiles(items.map(f => ({ ...f, path: prefix + f.name })))

    if (items.length) {
      const paths = items.map(f => prefix + f.name)
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

  useEffect(() => { loadFiles() }, [loadFiles])

  // ── Upload (all file types, auto-generate slug) ────────────────────
  const handleUpload = async e => {
    const uploads = Array.from(e.target.files)
    if (!uploads.length) return
    setUploading(true)

    await Promise.all(uploads.map(async file => {
      const path = activeFolder ? `${activeFolder}/${file.name}` : file.name
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
      if (error) return

      const existingMeta = await supabase
        .from('image_metadata').select('id').eq('storage_path', path).maybeSingle()
      if (!existingMeta.data) {
        await supabase.from('image_metadata').insert([{
          storage_path: path,
          slug:    autoSlug(activeFolder, file.name),
          folder:  activeFolder || null,
        }])
      }
    }))

    await loadFiles()
    setUploading(false)
    setToast(`${uploads.length} file${uploads.length > 1 ? 's' : ''} uploaded`)
    e.target.value = ''
  }

  // ── Create folder ──────────────────────────────────────────────────
  const createFolder = async () => {
    const name = newFolder.trim().replace(/\s+/g, '-')
    if (!name) return
    await supabase.storage.from(BUCKET).upload(`${name}/.keep`, new Blob(['']))
    setNewFolder('')
    setShowFolderInput(false)
    await loadFolders()
    setActiveFolder(name)
  }

  // ── Rename folder (updates storage paths, metadata, and slugs) ─────
  const renameFolder = async () => {
    const newName = renameValue.trim().replace(/\s+/g, '-')
    if (!newName || newName === renamingFolder) { setRenamingFolder(null); return }

    const { data: items } = await supabase.storage.from(BUCKET).list(renamingFolder, { limit: 500 })

    // Move all files in storage
    await Promise.all((items || []).map(f =>
      supabase.storage.from(BUCKET).move(`${renamingFolder}/${f.name}`, `${newName}/${f.name}`)
    ))

    // Fetch all metadata rows for this folder to update slugs individually
    const { data: rows } = await supabase
      .from('image_metadata').select('id, slug, storage_path').eq('folder', renamingFolder)

    if (rows?.length) {
      await Promise.all(rows.map(row => {
        const filename = row.storage_path.split('/').pop()
        const updatedSlug = updateSlugOnMove(row.slug, renamingFolder, newName, filename)
        const newPath = `${newName}/${filename}`
        return supabase.from('image_metadata').update({
          folder:       newName,
          storage_path: newPath,
          slug:         updatedSlug,
        }).eq('id', row.id)
      }))
    }

    setRenamingFolder(null)
    await loadFolders()
    if (activeFolder === renamingFolder) setActiveFolder(newName)
    setToast('Folder renamed — slugs updated')
  }

  // ── Copy URL ───────────────────────────────────────────────────────
  const copyUrl = async path => {
    await navigator.clipboard.writeText(getPublicUrl(path))
    setToast('URL copied!')
  }

  // ── Open drawer ────────────────────────────────────────────────────
  const openDrawer = file => {
    setDrawer(file)
    const m = metadata[file.path] || {}
    setDrawerMeta({
      slug:      m.slug      || autoSlug(activeFolder, file.name),
      alt_text:  m.alt_text  || '',
      title_tag: m.title_tag || '',
      caption:   m.caption   || '',
      folder:    m.folder    || activeFolder,
    })
  }

  // ── Save metadata (auto-updates slug when moving to new folder) ────
  const saveMeta = async () => {
    if (!drawer) return
    setSavingMeta(true)
    const existing = metadata[drawer.path]
    const movingFolder = drawerMeta.folder !== activeFolder

    let slug = drawerMeta.slug
    if (movingFolder) {
      slug = updateSlugOnMove(drawerMeta.slug, activeFolder, drawerMeta.folder, drawer.name)
    }

    const newPath = movingFolder
      ? `${drawerMeta.folder}/${drawer.name}`
      : drawer.path

    const payload = {
      storage_path: newPath,
      slug:         slug      || null,
      alt_text:     drawerMeta.alt_text  || null,
      title_tag:    drawerMeta.title_tag || null,
      caption:      drawerMeta.caption   || null,
      folder:       drawerMeta.folder    || null,
    }

    if (existing) {
      await supabase.from('image_metadata').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('image_metadata').insert([payload])
    }

    if (movingFolder) {
      await supabase.storage.from(BUCKET).move(drawer.path, newPath)
      await loadFiles()
      setDrawer(null)
    } else {
      await loadFiles()
    }

    setSavingMeta(false)
    setToast(movingFolder ? 'File moved — slug updated' : 'Metadata saved')
  }

  // ── Delete ─────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.storage.from(BUCKET).remove([deleteTarget.path])
    await supabase.from('image_metadata').delete().eq('storage_path', deleteTarget.path)
    await loadFiles()
    setDeleting(false)
    setDeleteTarget(null)
    if (drawer?.path === deleteTarget.path) setDrawer(null)
    setToast('File deleted')
  }

  return (
    <div className="p-6 sm:p-8">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">File Manager</h1>
          <p className="text-gray-400 text-sm mt-1">{files.length} files in this folder</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Grid / List toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-sm transition-colors ${viewMode === 'grid' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
              style={viewMode === 'grid' ? { backgroundColor: 'var(--accent)' } : {}}
              title="Grid view"
            >⊞</button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm transition-colors border-l border-gray-700 ${viewMode === 'list' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
              style={viewMode === 'list' ? { backgroundColor: 'var(--accent)' } : {}}
              title="List view"
            >☰</button>
          </div>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="btn-admin btn-sm disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : '↑ Upload'}
          </button>
        </div>
      </div>

      {/* ── Folder tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {folders.map(f => (
          renamingFolder === f ? (
            <div key={f} className="flex items-center gap-1">
              <input
                autoFocus
                type="text"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') renameFolder(); if (e.key === 'Escape') setRenamingFolder(null) }}
                className="admin-input py-1 text-sm w-32"
              />
              <button onClick={renameFolder} className="btn-admin btn-sm">Save</button>
              <button onClick={() => setRenamingFolder(null)} className="text-gray-500 hover:text-white text-sm">✕</button>
            </div>
          ) : (
            <div key={f} className="group/tab relative flex items-center">
              <button
                onClick={() => setActiveFolder(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border pr-7 ${
                  activeFolder === f
                    ? 'text-white border-transparent'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                }`}
                style={activeFolder === f ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
              >
                {f}
              </button>
              <button
                onClick={() => { setRenamingFolder(f); setRenameValue(f) }}
                className="absolute right-2 opacity-0 group-hover/tab:opacity-100 transition-opacity text-xs text-gray-400 hover:text-white"
                title="Rename folder"
              >✏️</button>
            </div>
          )
        ))}

        {showFolderInput ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={newFolder}
              onChange={e => setNewFolder(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowFolderInput(false) }}
              placeholder="Folder Name"
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

      {/* ── File grid / list ─────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : files.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-sm">
          <p className="text-4xl mb-3">📂</p>
          <p>No files in this folder. Upload some!</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid view ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map(file => {
            const url  = getPublicUrl(file.path)
            const meta = metadata[file.path]
            const hasMeta = !!(meta?.alt_text && meta?.slug && meta?.title_tag)
            return (
              <div key={file.path} className="admin-card rounded-xl overflow-hidden group relative">
                <div className="aspect-square bg-black/20 relative overflow-hidden">
                  {isImage(file.name) ? (
                    <img
                      src={url}
                      alt={meta?.alt_text || file.name}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <span className="text-4xl">{fileIcon(file.name)}</span>
                      <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                        {file.name.split('.').pop()}
                      </span>
                    </div>
                  )}
                  <span
                    className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-black/30"
                    style={{ backgroundColor: hasMeta ? '#22c55e' : '#6b7280' }}
                    title={hasMeta ? 'SEO complete' : 'SEO incomplete'}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => copyUrl(file.path)} title="Copy URL" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors">🔗</button>
                    <button onClick={() => openDrawer(file)} title="Edit metadata" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors">✏️</button>
                    <button onClick={() => setDeleteTarget(file)} title="Delete" className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 text-sm transition-colors">🗑️</button>
                  </div>
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-xs text-gray-400 truncate font-medium">{file.name}</p>
                  {file.metadata?.size && (
                    <p className="text-xs text-gray-600 mt-0.5">{fileSize(file.metadata.size)}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── List view ── */
        <div className="admin-card rounded-xl overflow-hidden divide-y" style={{ borderColor: 'var(--admin-border)', divideColor: 'var(--admin-border)' }}>
          {/* header row */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center px-4 py-2 text-xs text-gray-600 font-bold uppercase tracking-wider gap-4">
            <span className="w-8" />
            <span>Name</span>
            <span className="w-24 text-right">Size</span>
            <span className="w-16 text-center">SEO</span>
            <span className="w-20" />
          </div>
          {files.map(file => {
            const meta    = metadata[file.path]
            const hasMeta = !!(meta?.alt_text && meta?.slug && meta?.title_tag)
            return (
              <div key={file.path}
                   className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center px-4 py-3 gap-4 hover:bg-white/5 transition-colors group">
                {/* icon / thumbnail */}
                <div className="w-8 h-8 rounded overflow-hidden shrink-0 flex items-center justify-center bg-white/5">
                  {isImage(file.name)
                    ? <img src={getPublicUrl(file.path)} alt="" className="w-full h-full object-cover" loading="lazy" />
                    : <span className="text-lg">{fileIcon(file.name)}</span>
                  }
                </div>
                {/* name + slug */}
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{file.name}</p>
                  {meta?.slug && (
                    <p className="text-xs text-gray-500 truncate font-mono">{meta.slug}</p>
                  )}
                </div>
                {/* size */}
                <span className="w-24 text-right text-xs text-gray-500">
                  {fileSize(file.metadata?.size)}
                </span>
                {/* seo dot */}
                <span className="w-16 flex justify-center">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: hasMeta ? '#22c55e' : '#6b7280' }}
                    title={hasMeta ? 'SEO complete' : 'SEO incomplete'}
                  />
                </span>
                {/* actions */}
                <div className="w-20 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyUrl(file.path)} title="Copy URL" className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs">🔗</button>
                  <button onClick={() => openDrawer(file)} title="Edit" className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs">✏️</button>
                  <button onClick={() => setDeleteTarget(file)} title="Delete" className="w-7 h-7 rounded bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 text-xs">🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Edit Drawer ──────────────────────────────────────────────── */}
      {drawer && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDrawer(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col overflow-hidden"
               style={{ backgroundColor: 'var(--admin-surface)', borderLeft: '1px solid var(--admin-border)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <h3 className="text-white font-extrabold text-sm truncate pr-4">{drawer.name}</h3>
              <button onClick={() => setDrawer(null)} className="text-gray-500 hover:text-white text-xl leading-none shrink-0">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* preview */}
              {isImage(drawer.name) ? (
                <div className="rounded-xl overflow-hidden aspect-video bg-black/20">
                  <img src={getPublicUrl(drawer.path)} alt={drawer.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="rounded-xl bg-black/20 aspect-video flex flex-col items-center justify-center gap-2">
                  <span className="text-5xl">{fileIcon(drawer.name)}</span>
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    {drawer.name.split('.').pop()} file
                  </span>
                  {drawer.metadata?.size && (
                    <span className="text-xs text-gray-600">{fileSize(drawer.metadata.size)}</span>
                  )}
                </div>
              )}
              {/* public URL */}
              <div>
                <label className="admin-label">Public URL</label>
                <div className="flex gap-2">
                  <input readOnly value={getPublicUrl(drawer.path)} className="admin-input text-xs flex-1 cursor-text" />
                  <button onClick={() => copyUrl(drawer.path)} className="btn-admin btn-sm shrink-0">Copy</button>
                </div>
              </div>
              <SeoScore meta={drawerMeta} />
              <div className="space-y-4">
                {/* Slug */}
                <div>
                  <label className="admin-label">
                    Slug
                    <span className="text-gray-600 font-normal normal-case ml-1">(auto-updates on folder move)</span>
                  </label>
                  <input
                    type="text"
                    value={drawerMeta.slug}
                    onChange={e => setDrawerMeta(p => ({ ...p, slug: e.target.value }))}
                    placeholder="folder/file-name"
                    className="admin-input font-mono text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Format: <code className="bg-white/5 px-1 rounded">folder/file-name</code> — updates automatically when you move the file.
                  </p>
                </div>
                <div>
                  <label className="admin-label">Alt Text</label>
                  <input type="text" value={drawerMeta.alt_text} onChange={e => setDrawerMeta(p => ({ ...p, alt_text: e.target.value }))} placeholder="Describe the file for screen readers" className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Title Tag</label>
                  <input type="text" value={drawerMeta.title_tag} onChange={e => setDrawerMeta(p => ({ ...p, title_tag: e.target.value }))} placeholder="File title" className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Caption</label>
                  <textarea rows={3} value={drawerMeta.caption} onChange={e => setDrawerMeta(p => ({ ...p, caption: e.target.value }))} placeholder="Optional caption text" className="admin-input resize-none" />
                </div>
                {/* Move to folder */}
                <div>
                  <label className="admin-label">Move to Folder</label>
                  <select value={drawerMeta.folder} onChange={e => setDrawerMeta(p => ({ ...p, folder: e.target.value }))} className="admin-input">
                    {folders.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  {drawerMeta.folder !== activeFolder && (
                    <p className="text-xs text-amber-400 mt-1">
                      ⚡ Slug will update to <code className="bg-white/5 px-1 rounded">{updateSlugOnMove(drawerMeta.slug, activeFolder, drawerMeta.folder, drawer.name)}</code>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-5 border-t flex gap-3" style={{ borderColor: 'var(--admin-border)' }}>
              <button onClick={saveMeta} disabled={savingMeta} className="flex-1 btn-admin btn-md disabled:opacity-60">
                {savingMeta ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setDeleteTarget(drawer)} className="px-4 py-2 rounded-xl text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors text-sm font-bold">🗑️</button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirmation ──────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="admin-card rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-extrabold text-lg mb-2">Delete File?</h3>
            <p className="text-gray-400 text-sm mb-6">
              <span className="text-white font-semibold">{deleteTarget.name}</span> will be permanently deleted and cannot be recovered.
            </p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-700 text-gray-300 hover:border-gray-600 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────────────── */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
