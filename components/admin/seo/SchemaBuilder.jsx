'use client'
import { useState } from 'react'

const SCHEMA_TEMPLATES = {
  Organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "",
    "url": "",
    "logo": "",
    "sameAs": []
  },
  LocalBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "",
    "address": { "@type": "PostalAddress", "addressCountry": "IN" },
    "telephone": "",
    "url": ""
  },
  Person: {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "",
    "jobTitle": "",
    "url": "",
    "sameAs": []
  },
  Service: {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "",
    "description": "",
    "provider": { "@type": "Organization", "name": "" }
  },
  FAQPage: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{ "@type": "Question", "name": "", "acceptedAnswer": { "@type": "Answer", "text": "" } }]
  },
  BreadcrumbList: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "" }]
  },
  Article: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "",
    "author": { "@type": "Person", "name": "" },
    "datePublished": "",
    "description": ""
  },
  WebPage: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "",
    "description": "",
    "url": ""
  }
}

export default function SchemaBuilder({ schemas = [], onChange }) {
  const [editIdx, setEditIdx] = useState(null)
  const [editJson, setEditJson] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [addType, setAddType] = useState('Organization')

  const addSchema = () => {
    const newSchema = SCHEMA_TEMPLATES[addType] || {}
    const updated = [...schemas, newSchema]
    onChange(updated)
    setEditIdx(updated.length - 1)
    setEditJson(JSON.stringify(newSchema, null, 2))
    setJsonError('')
  }

  const removeSchema = (idx) => {
    const updated = schemas.filter((_, i) => i !== idx)
    onChange(updated)
    if (editIdx === idx) { setEditIdx(null); setEditJson('') }
  }

  const openEdit = (idx) => {
    setEditIdx(idx)
    setEditJson(JSON.stringify(schemas[idx], null, 2))
    setJsonError('')
  }

  const saveEdit = () => {
    try {
      const parsed = JSON.parse(editJson)
      const updated = schemas.map((s, i) => i === editIdx ? parsed : s)
      onChange(updated)
      setEditIdx(null)
      setJsonError('')
    } catch {
      setJsonError('Invalid JSON')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={addType}
          onChange={e => setAddType(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }}
        >
          {Object.keys(SCHEMA_TEMPLATES).map(t => <option key={t}>{t}</option>)}
        </select>
        <button
          onClick={addSchema}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          + Add Schema
        </button>
      </div>

      {schemas.length === 0 && (
        <p className="text-sm text-gray-500 italic py-4 text-center">No schemas added yet. Add your first schema above.</p>
      )}

      {schemas.map((s, idx) => (
        <div key={idx} className="rounded-xl border p-4 space-y-3"
             style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              {s['@type'] || 'Schema'} #{idx + 1}
            </span>
            <div className="flex gap-2">
              <button onClick={() => openEdit(idx)}
                      className="text-xs px-3 py-1.5 rounded-lg text-gray-300 hover:text-white border"
                      style={{ borderColor: 'var(--admin-border)' }}>
                Edit JSON
              </button>
              <button onClick={() => removeSchema(idx)}
                      className="text-xs px-3 py-1.5 rounded-lg text-red-400 hover:text-red-300 border border-red-800">
                Remove
              </button>
            </div>
          </div>

          {editIdx === idx && (
            <div className="space-y-2">
              <textarea
                value={editJson}
                onChange={e => { setEditJson(e.target.value); setJsonError('') }}
                rows={12}
                className="w-full rounded-lg p-3 text-xs font-mono"
                style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: `1px solid ${jsonError ? '#ef4444' : 'var(--admin-border)'}` }}
              />
              {jsonError && <p className="text-xs text-red-400">{jsonError}</p>}
              <div className="flex gap-2">
                <button onClick={saveEdit}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                        style={{ backgroundColor: 'var(--accent)' }}>
                  Save
                </button>
                <button onClick={() => { setEditIdx(null); setJsonError('') }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {editIdx !== idx && (
            <pre className="text-xs text-gray-400 overflow-auto max-h-32 rounded p-2"
                 style={{ backgroundColor: 'var(--admin-bg)' }}>
              {JSON.stringify(s, null, 2).slice(0, 300)}{JSON.stringify(s, null, 2).length > 300 ? '...' : ''}
            </pre>
          )}
        </div>
      ))}
    </div>
  )
}
