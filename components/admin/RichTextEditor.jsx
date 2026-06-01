'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { useEffect, useCallback, useState } from 'react'

// ── Toolbar button helper ────────────────────────────────────────────────────
function Btn({ onClick, active, title, children, disabled }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 rounded text-xs font-semibold transition-all min-w-[28px] flex items-center justify-center
        ${active
          ? 'text-white'
          : 'text-gray-400 hover:text-white hover:bg-white/10'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
      `}
      style={active ? { backgroundColor: 'var(--accent)' } : {}}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 mx-0.5 flex-shrink-0" style={{ backgroundColor: 'var(--admin-border)' }} />
}

// ── Main component ───────────────────────────────────────────────────────────
export default function RichTextEditor({ value, onChange, placeholder = 'Write here…', minHeight = 280 }) {
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl,  setLinkUrl]  = useState('')
  const [showImg,  setShowImg]  = useState(false)
  const [showLink, setShowLink] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading:    { levels: [1, 2, 3] },
        codeBlock:  {},
        blockquote: {},
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'rte-link' } }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content:     value || '',
    editorProps: {
      attributes: {
        class:                  'rte-body',
        style:                  `min-height:${minHeight}px`,
        'data-placeholder':     placeholder,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // Sync external value changes (e.g. when loading a record for edit)
  useEffect(() => {
    if (!editor) return
    const cur = editor.getHTML()
    // Only reset if the value is meaningfully different (avoids cursor jump on every keystroke)
    if (value !== undefined && value !== cur && (value || '') !== (cur === '<p></p>' ? '' : cur)) {
      editor.commands.setContent(value || '', false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const insertImage = useCallback(() => {
    if (!imageUrl.trim() || !editor) return
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run()
    setImageUrl('')
    setShowImg(false)
  }, [editor, imageUrl])

  const setLink = useCallback(() => {
    if (!editor) return
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run()
    }
    setLinkUrl('')
    setShowLink(false)
  }, [editor, linkUrl])

  const insertTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  if (!editor) return null

  const can = editor.can().chain().focus()

  return (
    <div className="rte-wrap rounded-xl overflow-hidden" style={{ border: '1px solid var(--admin-border)', background: 'var(--admin-card)' }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="rte-toolbar flex flex-wrap items-center gap-0.5 p-2 border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}>

        {/* History */}
        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!can.undo().run()} title="Undo">↩</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!can.redo().run()} title="Redo">↪</Btn>

        <Divider />

        {/* Headings */}
        <Btn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraph">¶</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</Btn>

        <Divider />

        {/* Inline formatting */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()}          active={editor.isActive('bold')}          title="Bold"><strong>B</strong></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}        active={editor.isActive('italic')}        title="Italic"><em>I</em></Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()}     active={editor.isActive('underline')}     title="Underline"><u>U</u></Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()}        active={editor.isActive('strike')}        title="Strikethrough"><s>S</s></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()}          active={editor.isActive('code')}          title="Inline Code">`c`</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHighlight().run()}     active={editor.isActive('highlight')}     title="Highlight">🖍</Btn>

        <Divider />

        {/* Alignment */}
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()}    active={editor.isActive({ textAlign: 'left' })}    title="Align Left">⬤◁</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()}  active={editor.isActive({ textAlign: 'center' })}  title="Align Center">≡</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()}   active={editor.isActive({ textAlign: 'right' })}   title="Align Right">▷⬤</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">☰</Btn>

        <Divider />

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}  title="Bullet List">• —</Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">1.</Btn>

        <Divider />

        {/* Block */}
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">❝</Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()}  active={editor.isActive('codeBlock')}  title="Code Block">{`</>`}</Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">─</Btn>

        <Divider />

        {/* Table */}
        <Btn onClick={insertTable} title="Insert Table">⊞</Btn>
        {editor.isActive('table') && <>
          <Btn onClick={() => editor.chain().focus().addColumnAfter().run()}  title="Add Column">+C</Btn>
          <Btn onClick={() => editor.chain().focus().addRowAfter().run()}     title="Add Row">+R</Btn>
          <Btn onClick={() => editor.chain().focus().deleteColumn().run()}    title="Delete Column">−C</Btn>
          <Btn onClick={() => editor.chain().focus().deleteRow().run()}       title="Delete Row">−R</Btn>
          <Btn onClick={() => editor.chain().focus().deleteTable().run()}     title="Delete Table">✕T</Btn>
        </>}

        <Divider />

        {/* Link */}
        <Btn onClick={() => { setShowLink(v => !v); setShowImg(false) }} active={editor.isActive('link') || showLink} title="Insert Link">🔗</Btn>

        {/* Image */}
        <Btn onClick={() => { setShowImg(v => !v); setShowLink(false) }} title="Insert Image">🖼</Btn>

        <Divider />

        {/* Clear formatting */}
        <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">✕</Btn>
      </div>

      {/* ── Link input popup ──────────────────────────────────────────────── */}
      {showLink && (
        <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}>
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setLink()}
            placeholder="https://example.com"
            className="admin-input text-xs flex-1"
            style={{ maxWidth: 320 }}
          />
          <button type="button" onClick={setLink} className="btn-admin btn-sm text-xs px-3 py-1">Set Link</button>
          {editor.isActive('link') && (
            <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLink(false) }}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors">Remove</button>
          )}
          <button type="button" onClick={() => setShowLink(false)} className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded transition-colors">✕</button>
        </div>
      )}

      {/* ── Image URL input ───────────────────────────────────────────────── */}
      {showImg && (
        <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}>
          <input
            autoFocus
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && insertImage()}
            placeholder="https://... image URL"
            className="admin-input text-xs flex-1"
            style={{ maxWidth: 360 }}
          />
          <button type="button" onClick={insertImage} className="btn-admin btn-sm text-xs px-3 py-1">Insert</button>
          <button type="button" onClick={() => setShowImg(false)} className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded transition-colors">✕</button>
        </div>
      )}

      {/* ── Editor content area ───────────────────────────────────────────── */}
      <EditorContent editor={editor} className="rte-content-wrap" />
    </div>
  )
}
