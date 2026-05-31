'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { computeSeoScores } from '@/lib/seo-scoring'
import SeoScoreCard from './SeoScoreCard'
import SchemaBuilder from './SchemaBuilder'

const TABS = [
  { id: 'basic',     label: 'Basic SEO' },
  { id: 'content',   label: 'Content SEO' },
  { id: 'ai',        label: 'AI Overview' },
  { id: 'aeo',       label: 'AEO' },
  { id: 'geo',       label: 'GEO' },
  { id: 'schema',    label: 'Schema' },
  { id: 'technical', label: 'Technical' },
]

const INTENTS = ['informational', 'transactional', 'navigational', 'commercial']

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, maxLength, type = 'text' }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
      style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)', focusRingColor: 'var(--accent)' }}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2"
      style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }}
    />
  )
}

function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (v && !value.includes(v)) { onChange([...value, v]); setInput('') }
  }
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder || 'Type and press Enter'}
          className="flex-1 rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }}
        />
        <button onClick={add} className="px-3 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: 'var(--accent)' }}>Add</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/10 text-gray-200">
            {v}
            <button onClick={() => remove(i)} className="text-gray-400 hover:text-white ml-1">×</button>
          </span>
        ))}
      </div>
    </div>
  )
}

function FaqEditor({ value = [], onChange }) {
  const add = () => onChange([...value, { q: '', a: '' }])
  const update = (idx, field, val) => onChange(value.map((item, i) => i === idx ? { ...item, [field]: val } : item))
  const remove = (idx) => onChange(value.filter((_, i) => i !== idx))
  return (
    <div className="space-y-3">
      {value.map((item, idx) => (
        <div key={idx} className="rounded-xl border p-3 space-y-2"
             style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 font-semibold">FAQ #{idx + 1}</span>
            <button onClick={() => remove(idx)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
          </div>
          <input value={item.q || ''} onChange={e => update(idx, 'q', e.target.value)}
                 placeholder="Question" className="w-full rounded-lg px-3 py-2 text-sm"
                 style={{ backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }} />
          <textarea value={item.a || ''} onChange={e => update(idx, 'a', e.target.value)}
                    placeholder="Answer" rows={2} className="w-full rounded-lg px-3 py-2 text-sm resize-y"
                    style={{ backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }} />
        </div>
      ))}
      <button onClick={add} className="text-sm font-semibold px-4 py-2 rounded-lg border"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
        + Add FAQ
      </button>
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? '' : 'bg-gray-600'}`}
             style={checked ? { backgroundColor: 'var(--accent)' } : {}}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
        </div>
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  )
}

export default function SeoEditPanel({ contentType, contentId = null }) {
  const [tab, setTab] = useState('basic')
  const [meta, setMeta] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let q = supabase.from('seo_page_meta').select('*').eq('content_type', contentType)
    if (contentId) q = q.eq('content_id', contentId)
    else q = q.is('content_id', null)
    q.single().then(({ data }) => {
      setMeta(data || { content_type: contentType, content_id: contentId })
      setLoading(false)
    })
  }, [contentType, contentId])

  const set = useCallback((field) => (val) => setMeta(prev => ({ ...prev, [field]: val })), [])

  const save = async () => {
    setSaving(true)
    const scores = computeSeoScores(meta)
    const payload = {
      ...meta,
      seo_score: scores.overall,
      technical_score: scores.technical,
      ai_score: scores.ai,
      content_score: scores.content,
      schema_score: scores.schema,
      geo_score: scores.geo,
      aeo_score: scores.aeo,
    }
    if (meta.id) {
      await supabase.from('seo_page_meta').update(payload).eq('id', meta.id)
    } else {
      const { data } = await supabase.from('seo_page_meta').insert(payload).select().single()
      if (data) setMeta(data)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading SEO data…</div>

  const scores = computeSeoScores(meta)

  return (
    <div className="space-y-6">
      {/* Score row */}
      <div className="rounded-2xl border p-6"
           style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-bold text-lg">SEO Health</h3>
            <p className="text-sm text-gray-400 mt-0.5">Real-time score based on all SEO fields</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <SeoScoreCard label="Overall" score={scores.overall} size="lg" />
            <SeoScoreCard label="Basic" score={scores.basic} />
            <SeoScoreCard label="Content" score={scores.content} />
            <SeoScoreCard label="AI" score={scores.ai} />
            <SeoScoreCard label="AEO" score={scores.aeo} />
            <SeoScoreCard label="GEO" score={scores.geo} />
            <SeoScoreCard label="Schema" score={scores.schema} />
            <SeoScoreCard label="Technical" score={scores.technical} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b" style={{ borderColor: 'var(--admin-border)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${tab === t.id ? 'text-white border-b-2' : 'text-gray-400 hover:text-white'}`}
            style={tab === t.id ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-5">
        {tab === 'basic' && <BasicTab meta={meta} set={set} />}
        {tab === 'content' && <ContentTab meta={meta} set={set} />}
        {tab === 'ai' && <AiTab meta={meta} set={set} />}
        {tab === 'aeo' && <AeoTab meta={meta} set={set} />}
        {tab === 'geo' && <GeoTab meta={meta} set={set} />}
        {tab === 'schema' && <SchemaTab meta={meta} set={set} />}
        {tab === 'technical' && <TechnicalTab meta={meta} set={set} />}
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <span className="text-sm text-green-400 font-semibold">✓ Saved successfully</span>}
        <span className="text-xs text-gray-500 ml-auto">v{meta?.version || 1} · Last updated: {meta?.updated_at ? new Date(meta.updated_at).toLocaleString() : 'Never'}</span>
      </div>
    </div>
  )
}

function BasicTab({ meta, set }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Field label="Meta Title" hint={`${(meta?.meta_title || '').length}/60 chars`}>
        <Input value={meta?.meta_title} onChange={set('meta_title')} placeholder="Page title for search engines" maxLength={60} />
      </Field>
      <Field label="Slug / URL Path">
        <Input value={meta?.slug} onChange={set('slug')} placeholder="/services" />
      </Field>
      <Field label="Meta Description" hint={`${(meta?.meta_description || '').length}/160 chars`}>
        <Textarea value={meta?.meta_description} onChange={set('meta_description')} placeholder="Compelling description for SERPs (max 160 chars)" rows={2} />
      </Field>
      <Field label="Canonical URL">
        <Input value={meta?.canonical_url} onChange={set('canonical_url')} placeholder="https://marketingbyprince.com/services" />
      </Field>
      <Field label="Robots">
        <select value={meta?.robots || 'index, follow'} onChange={e => set('robots')(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }}>
          <option>index, follow</option>
          <option>noindex, follow</option>
          <option>index, nofollow</option>
          <option>noindex, nofollow</option>
        </select>
      </Field>
      <Field label="OG Type">
        <select value={meta?.og_type || 'website'} onChange={e => set('og_type')(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }}>
          <option value="website">website</option>
          <option value="article">article</option>
          <option value="profile">profile</option>
          <option value="product">product</option>
        </select>
      </Field>
      <Field label="OG Title">
        <Input value={meta?.og_title} onChange={set('og_title')} placeholder="Open Graph title" />
      </Field>
      <Field label="OG Description">
        <Textarea value={meta?.og_description} onChange={set('og_description')} placeholder="Open Graph description" rows={2} />
      </Field>
      <Field label="OG Image URL">
        <Input value={meta?.og_image} onChange={set('og_image')} placeholder="https://..." />
      </Field>
      <Field label="Twitter Card">
        <select value={meta?.twitter_card || 'summary_large_image'} onChange={e => set('twitter_card')(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }}>
          <option value="summary_large_image">summary_large_image</option>
          <option value="summary">summary</option>
        </select>
      </Field>
      <Field label="Twitter Title">
        <Input value={meta?.twitter_title} onChange={set('twitter_title')} placeholder="Twitter card title" />
      </Field>
      <Field label="Twitter Image URL">
        <Input value={meta?.twitter_image} onChange={set('twitter_image')} placeholder="https://..." />
      </Field>
    </div>
  )
}

function ContentTab({ meta, set }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Focus Keyword">
          <Input value={meta?.focus_keyword} onChange={set('focus_keyword')} placeholder="Primary target keyword" />
        </Field>
        <Field label="Search Intent">
          <select value={meta?.search_intent || ''} onChange={e => set('search_intent')(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                  style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }}>
            <option value="">Select intent…</option>
            {INTENTS.map(i => <option key={i}>{i}</option>)}
          </select>
        </Field>
        <Field label="Content Cluster">
          <Input value={meta?.content_cluster} onChange={set('content_cluster')} placeholder="e.g. Digital Marketing" />
        </Field>
        <Field label="Content Category">
          <Input value={meta?.content_category} onChange={set('content_category')} placeholder="e.g. SEO" />
        </Field>
      </div>
      <Field label="Secondary Keywords">
        <TagInput value={meta?.secondary_keywords || []} onChange={set('secondary_keywords')} placeholder="Add keyword and press Enter" />
      </Field>
    </div>
  )
}

function AiTab({ meta, set }) {
  return (
    <div className="space-y-5">
      <Field label="AI Summary" hint="Concise summary optimized for AI overview features">
        <Textarea value={meta?.ai_summary} onChange={set('ai_summary')} placeholder="Clear, factual summary of this page's content" rows={4} />
      </Field>
      <Field label="Key Takeaways">
        <TagInput value={meta?.ai_key_takeaways || []} onChange={set('ai_key_takeaways')} placeholder="Add takeaway" />
      </Field>
      <Field label="Expert Insights">
        <Textarea value={meta?.ai_expert_insights} onChange={set('ai_expert_insights')} placeholder="Expert-level insights and analysis" rows={3} />
      </Field>
      <Field label="Statistics / Data Points">
        <TagInput value={meta?.ai_stats || []} onChange={set('ai_stats')} placeholder="e.g. 93% of online experiences begin with search" />
      </Field>
      <Field label="Sources / References">
        <TagInput value={meta?.ai_sources || []} onChange={set('ai_sources')} placeholder="https://..." />
      </Field>
      <Field label="FAQ for AI Overview">
        <FaqEditor value={meta?.ai_faq || []} onChange={set('ai_faq')} />
      </Field>
    </div>
  )
}

function AeoTab({ meta, set }) {
  return (
    <div className="space-y-5">
      <Field label="Target Questions" hint="Questions your page should answer">
        <TagInput value={meta?.aeo_questions || []} onChange={set('aeo_questions')} placeholder="What is digital marketing?" />
      </Field>
      <Field label="Featured Snippet Target" hint="Exact text optimized for Google featured snippets">
        <Textarea value={meta?.aeo_featured_snippet} onChange={set('aeo_featured_snippet')} placeholder="Begin with the question's definition or direct answer" rows={3} />
      </Field>
      <Field label="Short Answer (≤40 words)" hint="Concise voice-search ready answer">
        <Textarea value={meta?.aeo_short_answer} onChange={set('aeo_short_answer')} rows={2} />
      </Field>
      <Field label="Long Answer">
        <Textarea value={meta?.aeo_long_answer} onChange={set('aeo_long_answer')} rows={5} />
      </Field>
      <Field label="FAQ Schema Entries">
        <FaqEditor value={meta?.aeo_faq_schema || []} onChange={set('aeo_faq_schema')} />
      </Field>
    </div>
  )
}

function GeoTab({ meta, set }) {
  return (
    <div className="space-y-5">
      <Field label="Named Entities" hint="People, places, organisations referenced">
        <TagInput value={meta?.geo_entities || []} onChange={set('geo_entities')} placeholder="Marketing By Prince, Kolkata, Google..." />
      </Field>
      <Field label="Brand Mentions">
        <TagInput value={meta?.geo_brand_mentions || []} onChange={set('geo_brand_mentions')} placeholder="Brand names" />
      </Field>
      <Field label="Service Mentions">
        <TagInput value={meta?.geo_service_mentions || []} onChange={set('geo_service_mentions')} placeholder="SEO, Paid Ads, Social Media..." />
      </Field>
      <Field label="Industry Mentions">
        <TagInput value={meta?.geo_industry_mentions || []} onChange={set('geo_industry_mentions')} placeholder="Digital Marketing, MarTech..." />
      </Field>
      <Field label="Topical Authority Statement">
        <Textarea value={meta?.geo_topical_authority} onChange={set('geo_topical_authority')} placeholder="Describe this page's depth of coverage and authority" rows={3} />
      </Field>
      <Field label="Semantic Relevance Score (0–100)">
        <input type="range" min={0} max={100} value={meta?.geo_semantic_score || 0}
               onChange={e => set('geo_semantic_score')(parseInt(e.target.value))}
               className="w-full accent-orange-500" />
        <p className="text-sm text-gray-400 mt-1">{meta?.geo_semantic_score || 0} / 100</p>
      </Field>
    </div>
  )
}

function SchemaTab({ meta, set }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4"
           style={{ borderColor: 'var(--warn-border)', backgroundColor: 'var(--warn-canvas)' }}>
        <p className="text-sm text-amber-800 font-medium">
          Schemas are injected as JSON-LD in the page &lt;head&gt;. Use the preview to validate before saving.
        </p>
      </div>
      <SchemaBuilder schemas={meta?.schemas || []} onChange={set('schemas')} />
    </div>
  )
}

function TechnicalTab({ meta, set }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Toggle checked={meta?.is_indexed !== false} onChange={set('is_indexed')} label="Indexed by search engines" />
        <Toggle checked={meta?.is_followed !== false} onChange={set('is_followed')} label="Links followed" />
        <Toggle checked={meta?.has_canonical !== false} onChange={set('has_canonical')} label="Has canonical tag" />
        <Toggle checked={meta?.in_sitemap !== false} onChange={set('in_sitemap')} label="Included in sitemap" />
      </div>
      <Field label="Structured Data Types Present">
        <TagInput value={meta?.structured_data_types || []} onChange={set('structured_data_types')} placeholder="FAQ, Organization, BreadcrumbList..." />
      </Field>
    </div>
  )
}
