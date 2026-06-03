'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const BUCKET = 'website-assets'

/* ── utils ─────────────────────────────────────────────────────── */
function getPublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const pathToSlug = p => p ? p.split('/').map(slugify).join('/') : ''
function autoSlug(folder, filename) {
  const base = slugify(filename.replace(/\.[^/.]+$/, ''))
  return folder ? `${pathToSlug(folder)}/${base}` : base
}
function updateSlugOnMove(current, oldFolder, newFolder, filename) {
  const base = slugify(filename.replace(/\.[^/.]+$/, ''))
  const expected = oldFolder ? `${pathToSlug(oldFolder)}/${base}` : base
  if (!current || current === expected) {
    return newFolder ? `${pathToSlug(newFolder)}/${base}` : base
  }
  return current
}
function fileSize(b) {
  if (!b) return ''
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}
const EXT_ICONS = [
  [/\.(jpe?g|png|webp|gif|avif)$/i, '🖼️'],
  [/\.svg$/i, '⬡'], [/\.pdf$/i, '📄'],
  [/\.(mp4|mov|avi|webm|mkv)$/i, '🎬'],
  [/\.(mp3|wav|ogg|flac|aac)$/i, '🎵'],
  [/\.(doc|docx)$/i, '📝'], [/\.(xls|xlsx|csv)$/i, '📊'],
  [/\.(ppt|pptx)$/i, '📑'], [/\.(zip|rar|tar|gz|7z)$/i, '🗜️'],
  [/\.(js|ts|jsx|tsx|json|html|css|py|rb|php|sh)$/i, '💻'],
  [/\.(txt|md|log)$/i, '📋'],
]
function fileIcon(n) { for (const [r, i] of EXT_ICONS) if (r.test(n)) return i; return '📄' }
function isImage(n) { return /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(n) }

/* ── recursive storage ops ──────────────────────────────────────── */
async function listAllFiles(folder) {
  const { data } = await supabase.storage.from(BUCKET).list(folder, { limit: 500 })
  const files = [], subs = []
  for (const item of data || []) {
    const full = `${folder}/${item.name}`
    if (item.metadata) files.push(full); else subs.push(listAllFiles(full))
  }
  return [...files, ...(await Promise.all(subs)).flat()]
}
async function moveFolderContents(oldBase, newBase) {
  const files = await listAllFiles(oldBase)
  await Promise.all(files.map(f =>
    supabase.storage.from(BUCKET).move(f, `${newBase}/${f.slice(oldBase.length + 1)}`)
  ))
  const { data: rows } = await supabase.from('image_metadata')
    .select('id,storage_path,slug').like('storage_path', `${oldBase}/%`)
  if (rows?.length) await Promise.all(rows.map(row => {
    const rel     = row.storage_path.slice(oldBase.length + 1)
    const newPath = `${newBase}/${rel}`
    const oldF    = row.storage_path.split('/').slice(0, -1).join('/')
    const newF    = newPath.split('/').slice(0, -1).join('/')
    const fname   = rel.split('/').pop()
    return supabase.from('image_metadata').update({
      storage_path: newPath, folder: newF,
      slug: updateSlugOnMove(row.slug, oldF, newF, fname),
    }).eq('id', row.id)
  }))
}
async function deleteFolderContents(folder) {
  const files = await listAllFiles(folder)
  if (!files.length) return
  await supabase.storage.from(BUCKET).remove(files)
  await supabase.from('image_metadata').delete().in('storage_path', files)
}

/* ── Toast ──────────────────────────────────────────────────────── */
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="fixed bottom-6 right-6 z-[200] px-5 py-3 rounded-xl text-sm font-bold text-white shadow-xl"
         style={{ backgroundColor: 'var(--accent)' }}>{msg}</div>
  )
}

/* ── SeoScore ───────────────────────────────────────────────────── */
function SeoScore({ meta }) {
  const n = [meta.alt_text, meta.slug, meta.title_tag].filter(Boolean).length
  const c = n === 3 ? '#22c55e' : n ? '#f59e0b' : '#6b7280'
  const l = n === 3 ? 'SEO Good' : n ? 'SEO Partial' : 'SEO Missing'
  return (
    <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg"
         style={{ background: `${c}15`, border: `1px solid ${c}40` }}>
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c }} />
      <span className="text-xs font-bold" style={{ color: c }}>{l}</span>
      <span className="text-xs ml-auto text-gray-500">{n}/3</span>
    </div>
  )
}

/* ── FolderNode ─────────────────────────────────────────────────── */
function FolderNode({ path, name, currentPath, depth, onSelect,
                      dragOver, setDragOver, onDrop,
                      onRename, onDeleteFolder, onNewSubfolder, treeRefresh }) {
  const [open, setOpen]       = useState(false)
  const [kids, setKids]       = useState(null)   // null=unloaded

  const loadKids = useCallback(async () => {
    const { data } = await supabase.storage.from(BUCKET).list(path, { limit: 200 })
    setKids((data || []).filter(f => !f.metadata).map(f => ({
      name: f.name, path: `${path}/${f.name}`,
    })))
  }, [path])

  // Auto-expand ancestor of currentPath
  useEffect(() => {
    if (currentPath === path || currentPath.startsWith(path + '/')) {
      loadKids(); setOpen(true)
    }
  }, [currentPath])

  // Reload when tree changes (new folder, rename, etc.)
  useEffect(() => { if (open) loadKids() }, [treeRefresh])

  const toggle = async e => {
    e.stopPropagation()
    if (!open && kids === null) await loadKids()
    setOpen(p => !p)
  }

  const active   = currentPath === path
  const dropping = dragOver === path

  return (
    <div>
      <div
        className="group/fn flex items-center gap-1 py-1.5 pr-1 rounded-lg cursor-pointer select-none transition-all"
        style={{
          paddingLeft: `${8 + depth * 14}px`,
          ...(active    ? { backgroundColor: 'var(--accent)', color: '#fff' }
                        : { color: '#9ca3af' }),
          ...(dropping  ? { outline: '2px solid var(--accent)', outlineOffset: '-2px' } : {}),
        }}
        onClick={() => onSelect(path)}
        onDragOver={e => { e.preventDefault(); setDragOver(path) }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null) }}
        onDrop={e => { e.preventDefault(); setDragOver(null); onDrop(path) }}
      >
        <button className="w-4 h-4 flex items-center justify-center text-[10px] shrink-0 opacity-50 hover:opacity-100"
                onClick={toggle}>
          {kids?.length ? (open ? '▾' : '▸') : <span style={{ fontSize: 7 }}>●</span>}
        </button>
        <span className="text-sm leading-none">📁</span>
        <span className="text-xs font-medium flex-1 truncate ml-0.5 group-hover/fn:text-white">{name}</span>
        <div className="flex gap-0.5 opacity-0 group-hover/fn:opacity-100 shrink-0 mr-1"
             onClick={e => e.stopPropagation()}>
          <button onClick={() => onNewSubfolder(path)} title="New subfolder"
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-[11px] text-gray-500 hover:text-white">+</button>
          <button onClick={() => onRename(path, name)} title="Rename"
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-[10px] text-gray-500 hover:text-white">✏️</button>
          <button onClick={() => onDeleteFolder(path, name)} title="Delete"
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/10 text-[10px] text-red-500/60 hover:text-red-400">🗑️</button>
        </div>
      </div>
      {open && kids?.map(k => (
        <FolderNode key={k.path} {...k} currentPath={currentPath} depth={depth + 1}
                    onSelect={onSelect} dragOver={dragOver} setDragOver={setDragOver}
                    onDrop={onDrop} onRename={onRename} onDeleteFolder={onDeleteFolder}
                    onNewSubfolder={onNewSubfolder} treeRefresh={treeRefresh} />
      ))}
    </div>
  )
}

/* ── FileManager ────────────────────────────────────────────────── */
export default function FileManager() {
  const [currentPath,   setCurrentPath]  = useState('')
  const [items,         setItems]        = useState([])
  const [metadata,      setMetadata]     = useState({})
  const [loading,       setLoading]      = useState(false)
  const [rootFolders,   setRootFolders]  = useState([])
  const [treeRefresh,   setTreeRefresh]  = useState(0)
  const bumpTree = () => setTreeRefresh(n => n + 1)

  // drag
  const [dragItem,  setDragItem]  = useState(null)
  const [dragOver,  setDragOver]  = useState(null)

  // drawer
  const [drawer,     setDrawer]     = useState(null)
  const [drawerMeta, setDrawerMeta] = useState({})
  const [savingMeta, setSavingMeta] = useState(false)

  // modals
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)
  const [renameTarget, setRenameTarget] = useState(null)  // {path, oldName, newName}
  const [renaming,     setRenaming]     = useState(false)
  const [newFolderIn,  setNewFolderIn]  = useState(null)  // parent path
  const [newFolderName,setNewFolderName]= useState('')
  const [creatingDir,  setCreatingDir]  = useState(false)

  const [uploading, setUploading] = useState(false)
  const [viewMode,  setViewMode]  = useState('grid')
  const [toast,     setToast]     = useState(null)
  const fileRef = useRef()

  /* ── root folders ── */
  const loadRoot = useCallback(async () => {
    const { data } = await supabase.storage.from(BUCKET).list('', { limit: 200 })
    setRootFolders((data || []).filter(f => !f.metadata).map(f => f.name))
  }, [])
  useEffect(() => { loadRoot() }, [treeRefresh])

  /* ── current folder contents ── */
  const loadContents = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.storage.from(BUCKET)
      .list(currentPath || '', { limit: 500, sortBy: { column: 'name', order: 'asc' } })
    const skip = new Set(['.keep', '.emptyFolderPlaceholder'])
    const prefix = currentPath ? `${currentPath}/` : ''
    const enriched = (data || [])
      .filter(i => !skip.has(i.name))
      .map(i => ({ ...i, path: prefix + i.name, isFolder: !i.metadata }))
    setItems(enriched)
    const filePaths = enriched.filter(i => !i.isFolder).map(i => i.path)
    if (filePaths.length) {
      const { data: rows } = await supabase.from('image_metadata')
        .select('*').in('storage_path', filePaths)
      const map = {}
      ;(rows || []).forEach(r => { map[r.storage_path] = r })
      setMetadata(map)
    } else { setMetadata({}) }
    setLoading(false)
  }, [currentPath])
  useEffect(() => { loadContents() }, [loadContents])

  /* ── breadcrumbs ── */
  const crumbs = currentPath
    ? [{ label: 'root', path: '' },
       ...currentPath.split('/').map((s, i, a) => ({ label: s, path: a.slice(0, i + 1).join('/') }))]
    : [{ label: 'root', path: '' }]

  /* ── navigate ── */
  const go = p => { setCurrentPath(p); setDragItem(null) }

  /* ── upload ── */
  const handleUpload = async e => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    await Promise.all(files.map(async file => {
      const dest = currentPath ? `${currentPath}/${file.name}` : file.name
      const { error } = await supabase.storage.from(BUCKET).upload(dest, file, { upsert: true })
      if (error) return
      const { data: ex } = await supabase.from('image_metadata')
        .select('id').eq('storage_path', dest).maybeSingle()
      if (!ex) await supabase.from('image_metadata').insert([{
        storage_path: dest, slug: autoSlug(currentPath, file.name), folder: currentPath || null,
      }])
    }))
    await loadContents()
    setUploading(false)
    setToast(`${files.length} file${files.length > 1 ? 's' : ''} uploaded`)
    e.target.value = ''
  }

  /* ── create folder ── */
  const createFolder = async () => {
    const name = newFolderName.trim().replace(/\s+/g, '-')
    if (!name) return
    setCreatingDir(true)
    const base = newFolderIn ?? currentPath
    const dest = base ? `${base}/${name}` : name
    await supabase.storage.from(BUCKET).upload(`${dest}/.keep`, new Blob(['']))
    setNewFolderName(''); setNewFolderIn(null); setCreatingDir(false)
    bumpTree(); await loadContents()
    setToast('Folder created')
  }

  /* ── rename folder ── */
  const doRename = async () => {
    if (!renameTarget) return
    const newName = renameTarget.newName.trim().replace(/\s+/g, '-')
    if (!newName || newName === renameTarget.oldName) { setRenameTarget(null); return }
    setRenaming(true)
    const parent  = renameTarget.path.split('/').slice(0, -1).join('/')
    const newPath = parent ? `${parent}/${newName}` : newName
    await moveFolderContents(renameTarget.path, newPath)
    // if we were inside the renamed folder, update navigation
    if (currentPath === renameTarget.path || currentPath.startsWith(renameTarget.path + '/')) {
      setCurrentPath(currentPath.replace(renameTarget.path, newPath))
    }
    setRenameTarget(null); setRenaming(false)
    bumpTree(); await loadContents()
    setToast('Folder renamed — slugs updated')
  }

  /* ── delete folder ── */
  const doDeleteFolder = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteFolderContents(deleteTarget.path)
    if (currentPath === deleteTarget.path || currentPath.startsWith(deleteTarget.path + '/')) {
      setCurrentPath(deleteTarget.path.split('/').slice(0, -1).join('/'))
    }
    setDeleteTarget(null); setDeleting(false)
    bumpTree(); await loadContents()
    setToast('Folder deleted')
  }

  /* ── delete file ── */
  const doDeleteFile = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.storage.from(BUCKET).remove([deleteTarget.path])
    await supabase.from('image_metadata').delete().eq('storage_path', deleteTarget.path)
    if (drawer?.path === deleteTarget.path) setDrawer(null)
    setDeleteTarget(null); setDeleting(false)
    await loadContents()
    setToast('File deleted')
  }

  /* ── drag & drop ── */
  const onDrop = async targetFolder => {
    if (!dragItem) return
    setDragItem(null)

    if (dragItem.isFolder) {
      if (targetFolder === dragItem.path || targetFolder.startsWith(dragItem.path + '/')) {
        setToast("Can't move a folder into itself"); return
      }
      const name    = dragItem.path.split('/').pop()
      const newPath = targetFolder ? `${targetFolder}/${name}` : name
      if (newPath === dragItem.path) return
      await moveFolderContents(dragItem.path, newPath)
      if (currentPath === dragItem.path || currentPath.startsWith(dragItem.path + '/'))
        setCurrentPath(newPath)
      bumpTree(); await loadContents()
      setToast('Folder moved — slugs updated')
    } else {
      const newPath = targetFolder ? `${targetFolder}/${dragItem.name}` : dragItem.name
      if (newPath === dragItem.path) return
      const { error } = await supabase.storage.from(BUCKET).move(dragItem.path, newPath)
      if (!error) {
        const ex = metadata[dragItem.path]
        const oldFolder = dragItem.path.split('/').slice(0, -1).join('/')
        const payload = {
          storage_path: newPath, folder: targetFolder || null,
          slug: updateSlugOnMove(ex?.slug, oldFolder, targetFolder, dragItem.name),
        }
        if (ex) await supabase.from('image_metadata').update(payload).eq('id', ex.id)
        else     await supabase.from('image_metadata').insert([payload])
        setToast('File moved — slug updated')
      }
      await loadContents()
    }
  }

  /* ── metadata drawer ── */
  const openDrawer = file => {
    setDrawer(file)
    const m = metadata[file.path] || {}
    setDrawerMeta({
      slug: m.slug || autoSlug(currentPath, file.name),
      alt_text: m.alt_text || '', title_tag: m.title_tag || '', caption: m.caption || '',
    })
  }
  const saveMeta = async () => {
    if (!drawer) return
    setSavingMeta(true)
    const ex = metadata[drawer.path]
    const payload = {
      storage_path: drawer.path, folder: currentPath || null,
      slug: drawerMeta.slug || null, alt_text: drawerMeta.alt_text || null,
      title_tag: drawerMeta.title_tag || null, caption: drawerMeta.caption || null,
    }
    if (ex) await supabase.from('image_metadata').update(payload).eq('id', ex.id)
    else     await supabase.from('image_metadata').insert([payload])
    await loadContents(); setSavingMeta(false); setToast('Metadata saved')
  }
  const copyUrl = async path => {
    await navigator.clipboard.writeText(getPublicUrl(path)); setToast('URL copied!')
  }

  /* ════════════════ render ════════════════ */
  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ══ Sidebar ══ */}
      <aside className="w-52 shrink-0 flex flex-col border-r overflow-hidden"
             style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>
        <div className="flex items-center justify-between px-3 py-2.5 border-b shrink-0"
             style={{ borderColor: 'var(--admin-border)' }}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Folders</span>
          <button onClick={() => { setNewFolderIn(currentPath); setNewFolderName('') }}
                  className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:text-white hover:bg-white/10 text-sm font-bold"
                  title="New folder in current location">+</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {/* root */}
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer select-none text-xs font-bold transition-all"
            style={{
              ...(currentPath === '' ? { backgroundColor: 'var(--accent)', color: '#fff' } : { color: '#9ca3af' }),
              ...(dragOver === '__root__' ? { outline: '2px solid var(--accent)', outlineOffset: '-2px' } : {}),
            }}
            onClick={() => go('')}
            onDragOver={e => { e.preventDefault(); setDragOver('__root__') }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null) }}
            onDrop={e => { e.preventDefault(); setDragOver(null); onDrop('') }}
          >
            <span>🗂️</span><span>root</span>
          </div>
          {rootFolders.map(name => (
            <FolderNode key={`${name}__${treeRefresh}`}
              path={name} name={name} currentPath={currentPath} depth={0}
              onSelect={go} dragOver={dragOver} setDragOver={setDragOver} onDrop={onDrop}
              onRename={(p, n) => setRenameTarget({ path: p, oldName: n, newName: n })}
              onDeleteFolder={(p, n) => setDeleteTarget({ type: 'folder', path: p, name: n })}
              onNewSubfolder={p => { setNewFolderIn(p); setNewFolderName('') }}
              treeRefresh={treeRefresh}
            />
          ))}
        </div>
      </aside>

      {/* ══ Main ══ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* toolbar */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b shrink-0"
             style={{ borderColor: 'var(--admin-border)' }}>
          {/* breadcrumb */}
          <nav className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto scrollbar-none">
            {crumbs.map((c, i) => (
              <span key={c.path} className="flex items-center gap-0.5 shrink-0">
                {i > 0 && <span className="text-gray-700 text-xs px-0.5">/</span>}
                <button onClick={() => go(c.path)}
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-colors ${
                          i === crumbs.length - 1
                            ? 'text-white cursor-default'
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}>{c.label}</button>
              </span>
            ))}
          </nav>
          {/* actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => { setNewFolderIn(currentPath); setNewFolderName('') }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                    style={{ borderColor: 'var(--admin-border)' }}>+ Folder</button>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--admin-border)' }}>
              {['grid','list'].map(m => (
                <button key={m} onClick={() => setViewMode(m)}
                        className={`px-3 py-1.5 text-sm transition-colors ${m === 'list' ? 'border-l' : ''} ${viewMode === m ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                        style={{ borderColor: 'var(--admin-border)', ...(viewMode === m ? { backgroundColor: 'var(--accent)' } : {}) }}>
                  {m === 'grid' ? '⊞' : '☰'}
                </button>
              ))}
            </div>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleUpload} />
            <button onClick={() => fileRef.current.click()} disabled={uploading} className="btn-admin btn-sm disabled:opacity-60">
              {uploading ? 'Uploading…' : '↑ Upload'}
            </button>
          </div>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto p-5"
             onDragOver={e => e.preventDefault()}
             onDrop={e => { e.preventDefault(); if (dragItem && dragOver === null) onDrop(currentPath) }}>
          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner" /></div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500 text-sm">
              <span className="text-5xl mb-3">📂</span>
              <p className="font-medium">Empty folder</p>
              <p className="text-xs mt-1 text-gray-600">Upload files or create a subfolder</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {items.map(item => item.isFolder ? (
                /* folder tile */
                <div key={item.path}
                     draggable
                     onDragStart={() => setDragItem({ ...item, isFolder: true })}
                     onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOver(item.path) }}
                     onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null) }}
                     onDrop={e => { e.preventDefault(); e.stopPropagation(); setDragOver(null); onDrop(item.path) }}
                     onClick={() => go(item.path)}
                     className="admin-card rounded-xl overflow-hidden cursor-pointer group transition-all select-none"
                     style={dragOver === item.path ? { outline: '2px solid var(--accent)', outlineOffset: '-2px' } : {}}>
                  <div className="aspect-square bg-black/10 flex flex-col items-center justify-center gap-2 relative group-hover:bg-white/5 transition-colors">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-150">📁</span>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                         onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setNewFolderIn(item.path); setNewFolderName('') }} title="New subfolder"
                              className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white font-bold">+</button>
                      <button onClick={() => setRenameTarget({ path: item.path, oldName: item.name, newName: item.name })} title="Rename"
                              className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">✏️</button>
                      <button onClick={() => setDeleteTarget({ type: 'folder', path: item.path, name: item.name })} title="Delete"
                              className="w-7 h-7 rounded bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 text-xs">🗑️</button>
                    </div>
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-xs text-gray-300 font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">Folder</p>
                  </div>
                </div>
              ) : (
                /* file tile */
                <div key={item.path}
                     draggable
                     onDragStart={() => setDragItem({ ...item, isFolder: false })}
                     className="admin-card rounded-xl overflow-hidden group relative cursor-grab active:cursor-grabbing select-none">
                  <div className="aspect-square bg-black/20 relative overflow-hidden">
                    {isImage(item.name)
                      ? <img src={getPublicUrl(item.path)} alt={metadata[item.path]?.alt_text || item.name}
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                      : <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <span className="text-4xl">{fileIcon(item.name)}</span>
                          <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{item.name.split('.').pop()}</span>
                        </div>
                    }
                    {(() => {
                      const m = metadata[item.path]
                      const ok = !!(m?.alt_text && m?.slug && m?.title_tag)
                      return <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-black/30"
                                   style={{ backgroundColor: ok ? '#22c55e' : '#6b7280' }} />
                    })()}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => copyUrl(item.path)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm">🔗</button>
                      <button onClick={() => openDrawer(item)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm">✏️</button>
                      <button onClick={() => setDeleteTarget({ type: 'file', path: item.path, name: item.name })}
                              className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 text-sm">🗑️</button>
                    </div>
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-xs text-gray-400 truncate font-medium">{item.name}</p>
                    {item.metadata?.size && <p className="text-xs text-gray-600 mt-0.5">{fileSize(item.metadata.size)}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* list view */
            <div className="admin-card rounded-xl overflow-hidden">
              <div className="grid gap-4 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 border-b"
                   style={{ gridTemplateColumns: 'auto 1fr auto auto auto', borderColor: 'var(--admin-border)' }}>
                <span className="w-8"/>
                <span>Name / Slug</span>
                <span className="w-20 text-right">Size</span>
                <span className="w-12 text-center">SEO</span>
                <span className="w-20"/>
              </div>
              {items.map(item => {
                const m  = metadata[item.path]
                const ok = !!(m?.alt_text && m?.slug && m?.title_tag)
                return (
                  <div key={item.path}
                       draggable={!item.isFolder}
                       onDragStart={!item.isFolder ? () => setDragItem({ ...item, isFolder: false }) : undefined}
                       onDragOver={item.isFolder ? e => { e.preventDefault(); setDragOver(item.path) } : undefined}
                       onDragLeave={item.isFolder ? () => setDragOver(null) : undefined}
                       onDrop={item.isFolder ? e => { e.preventDefault(); setDragOver(null); onDrop(item.path) } : undefined}
                       onClick={item.isFolder ? () => go(item.path) : undefined}
                       className={`grid gap-4 px-4 py-3 items-center border-b hover:bg-white/5 transition-colors group ${item.isFolder ? 'cursor-pointer' : ''}`}
                       style={{
                         gridTemplateColumns: 'auto 1fr auto auto auto',
                         borderColor: 'var(--admin-border)',
                         ...(dragOver === item.path ? { outline: '2px solid var(--accent)', outlineOffset: '-2px' } : {}),
                       }}>
                    <div className="w-8 h-8 rounded overflow-hidden shrink-0 flex items-center justify-center bg-white/5">
                      {item.isFolder ? <span className="text-lg">📁</span>
                        : isImage(item.name)
                          ? <img src={getPublicUrl(item.path)} alt="" className="w-full h-full object-cover" loading="lazy" />
                          : <span className="text-lg">{fileIcon(item.name)}</span>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{item.name}</p>
                      {!item.isFolder && m?.slug
                        ? <p className="text-xs text-gray-500 truncate font-mono">{m.slug}</p>
                        : item.isFolder && <p className="text-xs text-gray-600">Folder</p>
                      }
                    </div>
                    <span className="w-20 text-right text-xs text-gray-500">
                      {item.isFolder ? '—' : fileSize(item.metadata?.size)}
                    </span>
                    <span className="w-12 flex justify-center">
                      {!item.isFolder && (
                        <span className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: ok ? '#22c55e' : '#6b7280' }} />
                      )}
                    </span>
                    <div className="w-20 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                         onClick={e => e.stopPropagation()}>
                      {item.isFolder ? (
                        <>
                          <button onClick={() => { setNewFolderIn(item.path); setNewFolderName('') }} title="New subfolder"
                                  className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold text-white">+</button>
                          <button onClick={() => setRenameTarget({ path: item.path, oldName: item.name, newName: item.name })}
                                  className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">✏️</button>
                          <button onClick={() => setDeleteTarget({ type: 'folder', path: item.path, name: item.name })}
                                  className="w-7 h-7 rounded bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 text-xs">🗑️</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => copyUrl(item.path)} className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">🔗</button>
                          <button onClick={() => openDrawer(item)} className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">✏️</button>
                          <button onClick={() => setDeleteTarget({ type: 'file', path: item.path, name: item.name })}
                                  className="w-7 h-7 rounded bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 text-xs">🗑️</button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* ══ Metadata Drawer ══ */}
      {drawer && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDrawer(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col"
               style={{ backgroundColor: 'var(--admin-surface)', borderLeft: '1px solid var(--admin-border)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
                 style={{ borderColor: 'var(--admin-border)' }}>
              <h3 className="text-white font-extrabold text-sm truncate pr-4">{drawer.name}</h3>
              <button onClick={() => setDrawer(null)} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {isImage(drawer.name)
                ? <div className="rounded-xl overflow-hidden aspect-video bg-black/20">
                    <img src={getPublicUrl(drawer.path)} alt="" className="w-full h-full object-contain" />
                  </div>
                : <div className="rounded-xl bg-black/20 aspect-video flex flex-col items-center justify-center gap-2">
                    <span className="text-5xl">{fileIcon(drawer.name)}</span>
                    <span className="text-xs text-gray-500 uppercase font-bold">{drawer.name.split('.').pop()} file</span>
                  </div>
              }
              <div>
                <label className="admin-label">Public URL</label>
                <div className="flex gap-2">
                  <input readOnly value={getPublicUrl(drawer.path)} className="admin-input text-xs flex-1" />
                  <button onClick={() => copyUrl(drawer.path)} className="btn-admin btn-sm shrink-0">Copy</button>
                </div>
              </div>
              <SeoScore meta={drawerMeta} />
              <div className="space-y-4">
                <div>
                  <label className="admin-label">Slug</label>
                  <input type="text" value={drawerMeta.slug}
                         onChange={e => setDrawerMeta(p => ({ ...p, slug: e.target.value }))}
                         className="admin-input font-mono text-sm" placeholder="folder/sub/file-name" />
                  <p className="text-xs text-gray-600 mt-1">Auto-updates when file is moved.</p>
                </div>
                <div>
                  <label className="admin-label">Alt Text</label>
                  <input type="text" value={drawerMeta.alt_text}
                         onChange={e => setDrawerMeta(p => ({ ...p, alt_text: e.target.value }))}
                         className="admin-input" placeholder="Describe for screen readers" />
                </div>
                <div>
                  <label className="admin-label">Title Tag</label>
                  <input type="text" value={drawerMeta.title_tag}
                         onChange={e => setDrawerMeta(p => ({ ...p, title_tag: e.target.value }))}
                         className="admin-input" placeholder="File title" />
                </div>
                <div>
                  <label className="admin-label">Caption</label>
                  <textarea rows={3} value={drawerMeta.caption}
                            onChange={e => setDrawerMeta(p => ({ ...p, caption: e.target.value }))}
                            className="admin-input" placeholder="Optional caption" />
                </div>
              </div>
            </div>
            <div className="p-5 border-t flex gap-3 shrink-0" style={{ borderColor: 'var(--admin-border)' }}>
              <button onClick={saveMeta} disabled={savingMeta} className="flex-1 btn-admin btn-md disabled:opacity-60">
                {savingMeta ? 'Saving…' : 'Save Metadata'}
              </button>
              <button onClick={() => setDeleteTarget({ type: 'file', path: drawer.path, name: drawer.name })}
                      className="px-4 py-2 rounded-xl text-red-400 border border-red-500/30 hover:bg-red-500/10 text-sm font-bold">🗑️</button>
            </div>
          </div>
        </>
      )}

      {/* ══ New Folder Modal ══ */}
      {newFolderIn !== null && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="admin-card rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-extrabold text-lg mb-1">New Folder</h3>
            <p className="text-gray-500 text-xs mb-4">
              Inside: <span className="text-gray-300 font-mono">{newFolderIn || 'root'}</span>
            </p>
            <input autoFocus type="text" value={newFolderName}
                   onChange={e => setNewFolderName(e.target.value)}
                   onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setNewFolderIn(null) }}
                   placeholder="folder-name" className="admin-input mb-4" />
            <div className="flex gap-3">
              <button onClick={createFolder} disabled={creatingDir || !newFolderName.trim()} className="flex-1 btn-admin btn-md disabled:opacity-60">
                {creatingDir ? 'Creating…' : 'Create'}
              </button>
              <button onClick={() => setNewFolderIn(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-700 text-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Rename Folder Modal ══ */}
      {renameTarget && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="admin-card rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-extrabold text-lg mb-4">Rename Folder</h3>
            <input autoFocus type="text" value={renameTarget.newName}
                   onChange={e => setRenameTarget(p => ({ ...p, newName: e.target.value }))}
                   onKeyDown={e => { if (e.key === 'Enter') doRename(); if (e.key === 'Escape') setRenameTarget(null) }}
                   className="admin-input mb-3" />
            <p className="text-xs text-amber-400 mb-4">⚡ Slugs of all files inside will update automatically.</p>
            <div className="flex gap-3">
              <button onClick={doRename} disabled={renaming} className="flex-1 btn-admin btn-md disabled:opacity-60">
                {renaming ? 'Renaming…' : 'Rename'}
              </button>
              <button onClick={() => setRenameTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-700 text-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Modal ══ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="admin-card rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-extrabold text-lg mb-2">
              Delete {deleteTarget.type === 'folder' ? 'Folder' : 'File'}?
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              <span className="text-white font-semibold">{deleteTarget.name}</span> will be permanently deleted.
            </p>
            {deleteTarget.type === 'folder' && (
              <p className="text-amber-400 text-xs mb-4">⚠️ All contents including subfolders will also be deleted.</p>
            )}
            <div className={deleteTarget.type === 'file' ? 'mt-4' : ''}>
              <div className="flex gap-3">
                <button onClick={deleteTarget.type === 'folder' ? doDeleteFolder : doDeleteFile}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-60">
                  {deleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
                <button onClick={() => setDeleteTarget(null)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-700 text-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
