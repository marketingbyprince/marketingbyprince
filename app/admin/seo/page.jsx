'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { scoreColor, scoreLabel } from '@/lib/seo-scoring'
import SeoScoreCard from '@/components/admin/seo/SeoScoreCard'

const SINGLETON_SECTIONS = [
  { type: 'homepage',     label: 'Homepage',     icon: '🏠', href: '/admin/seo/homepage' },
  { type: 'services',     label: 'Services',     icon: '🎯', href: '/admin/seo/services' },
  { type: 'gigs',         label: 'Gigs',         icon: '📦', href: '/admin/seo/gigs' },
  { type: 'portfolio',    label: 'Portfolio',    icon: '🖼️', href: '/admin/seo/portfolio' },
  { type: 'case_studies', label: 'Case Studies', icon: '📁', href: '/admin/seo/case-studies' },
  { type: 'blogs',        label: 'Blogs',        icon: '✍️', href: '/admin/seo/blogs' },
  { type: 'about',        label: 'About Us',     icon: '👤', href: '/admin/seo/about' },
  { type: null,           label: 'Global Settings', icon: '⚙️', href: '/admin/seo/global' },
]

const COLLECTION_META = {
  gig:        { label: 'Gig',         baseHref: '/admin/seo/gigs' },
  blog_post:  { label: 'Blog Post',   baseHref: '/admin/seo/blogs' },
  case_study: { label: 'Case Study',  baseHref: '/admin/seo/case-studies' },
  service:    { label: 'Service',     baseHref: '/admin/seo/services' },
}

function Check({ ok }) {
  return <span className={ok ? 'text-green-500' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>
}

function ScorePill({ score }) {
  const color = scoreColor(score)
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color, backgroundColor: color + '18' }}>
      {score} · {scoreLabel(score)}
    </span>
  )
}

function AuditTable({ title, rows, editHref }) {
  if (!rows.length) return null
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{title}</h3>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--admin-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
              {['Page / Item', 'SEO Score', 'Title', 'Desc', 'OG', 'Canonical', 'Schema', 'FAQ/AI', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-white/3 transition-colors"
                  style={{ borderColor: 'var(--admin-border)' }}>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{p.label}</p>
                  {p.sublabel && <p className="text-xs text-gray-500">{p.sublabel}</p>}
                </td>
                <td className="px-4 py-3"><ScorePill score={p.seo_score || 0} /></td>
                <td className="px-4 py-3"><Check ok={Boolean(p.meta_title)} /></td>
                <td className="px-4 py-3"><Check ok={Boolean(p.meta_description)} /></td>
                <td className="px-4 py-3"><Check ok={Boolean(p.og_image)} /></td>
                <td className="px-4 py-3"><Check ok={Boolean(p.canonical_url)} /></td>
                <td className="px-4 py-3"><Check ok={Array.isArray(p.schemas) && p.schemas.length > 0} /></td>
                <td className="px-4 py-3"><Check ok={Array.isArray(p.ai_faq) && p.ai_faq.length > 0} /></td>
                <td className="px-4 py-3">
                  <Link href={p.editHref}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white whitespace-nowrap"
                        style={{ backgroundColor: 'var(--accent)' }}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const PAGE_LABELS = {
  homepage: 'Homepage', services: 'Services', gigs: 'Gigs', portfolio: 'Portfolio',
  case_studies: 'Case Studies', blogs: 'Blogs', about: 'About Us',
}
const PAGE_HREFS = {
  homepage: '/admin/seo/homepage', services: '/admin/seo/services', gigs: '/admin/seo/gigs',
  portfolio: '/admin/seo/portfolio', case_studies: '/admin/seo/case-studies',
  blogs: '/admin/seo/blogs', about: '/admin/seo/about',
}

export default function SeoOverviewPage() {
  const [allSeo, setAllSeo] = useState([])
  const [records, setRecords] = useState({ gigs: [], articles: [], caseStudies: [], services: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('seo_page_meta').select('*'),
      supabase.from('gigs').select('id, title, category'),
      supabase.from('articles').select('id, title, slug, category'),
      supabase.from('case_studies').select('id, title, client_name'),
      supabase.from('services').select('id, title, pillar'),
    ]).then(([{ data: seo }, { data: gigs }, { data: articles }, { data: cases }, { data: svcs }]) => {
      setAllSeo(seo || [])
      setRecords({
        gigs: gigs || [],
        articles: articles || [],
        caseStudies: cases || [],
        services: svcs || [],
      })
      setLoading(false)
    })
  }, [])

  // Build lookup maps
  const seoByKey = {}
  allSeo.forEach(s => {
    const key = s.content_id ? `${s.content_type}::${s.content_id}` : `singleton::${s.content_type}`
    seoByKey[key] = s
  })

  const singletons = allSeo.filter(s => s.content_id === null || s.content_id === undefined)

  const avgScore = allSeo.length
    ? Math.round(allSeo.reduce((s, p) => s + (p.seo_score || 0), 0) / allSeo.length)
    : 0

  const missing = {
    title:     allSeo.filter(p => !p.meta_title).length,
    desc:      allSeo.filter(p => !p.meta_description).length,
    og:        allSeo.filter(p => !p.og_image).length,
    schema:    allSeo.filter(p => !p.schemas || !p.schemas.length).length,
    canonical: allSeo.filter(p => !p.canonical_url).length,
    faq:       allSeo.filter(p => !p.ai_faq || !p.ai_faq.length).length,
  }

  // Build rows for each group
  const singletonRows = singletons
    .filter(p => PAGE_LABELS[p.content_type])
    .map(p => ({ ...p, label: PAGE_LABELS[p.content_type], editHref: PAGE_HREFS[p.content_type] }))

  const gigRows = records.gigs.map(g => {
    const seo = seoByKey[`gig::${g.id}`] || {}
    return { ...seo, label: g.title, sublabel: g.category, editHref: `/admin/seo/gigs/${g.id}` }
  })

  const blogRows = records.articles.map(a => {
    const seo = seoByKey[`blog_post::${a.slug}`] || {}
    return { ...seo, label: a.title, sublabel: `/${a.slug}`, editHref: `/admin/seo/blogs/${a.slug}` }
  })

  const caseRows = records.caseStudies.map(c => {
    const seo = seoByKey[`case_study::${c.id}`] || {}
    return { ...seo, label: c.title, sublabel: c.client_name, editHref: `/admin/seo/case-studies/${c.id}` }
  })

  const serviceRows = records.services.map(s => {
    const seo = seoByKey[`service::${s.id}`] || {}
    return { ...seo, label: s.title, sublabel: s.pillar, editHref: `/admin/seo/services/${s.id}` }
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">SEO Center</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all SEO, Technical SEO, AI & Content Discoverability settings</p>
        </div>
        <Link href="/admin/seo/global"
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: 'var(--accent)' }}>
          Global Settings
        </Link>
      </div>

      {/* Health summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border p-5 flex flex-col items-center gap-3"
             style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
          <SeoScoreCard label="Site-wide Score" score={avgScore} size="lg" />
        </div>
        {[
          { label: 'Missing Title',     count: missing.title },
          { label: 'Missing Desc',      count: missing.desc },
          { label: 'Missing OG Image',  count: missing.og },
          { label: 'Missing Canonical', count: missing.canonical },
          { label: 'Missing Schema',    count: missing.schema },
          { label: 'Missing FAQ/AI',    count: missing.faq },
        ].map(({ label, count }) => (
          <div key={label} className="rounded-2xl border p-5 flex flex-col justify-center"
               style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
            <p className="text-3xl font-extrabold" style={{ color: count > 0 ? '#ef4444' : '#22c55e' }}>{count}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Page cards */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4">Pages</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {SINGLETON_SECTIONS.map(({ type, label, icon, href }) => {
            const page = singletons.find(p => p.content_type === type)
            const score = page?.seo_score || 0
            return (
              <Link key={label} href={href}
                    className="rounded-2xl border p-5 hover:border-orange-500/50 transition-colors group"
                    style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
                <div className="text-2xl mb-3">{icon}</div>
                <p className="font-semibold text-white text-sm group-hover:text-orange-400 transition-colors">{label}</p>
                {type && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: scoreColor(score) }}>
                    {score} · {scoreLabel(score)}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* SEO Audit Overview — all pages + all records */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4">SEO Audit Overview</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : (
          <div>
            <AuditTable title="Singleton Pages" rows={singletonRows} />
            <AuditTable title={`Gigs (${gigRows.length})`} rows={gigRows} />
            <AuditTable title={`Blog Posts (${blogRows.length})`} rows={blogRows} />
            <AuditTable title={`Case Studies (${caseRows.length})`} rows={caseRows} />
            <AuditTable title={`Services (${serviceRows.length})`} rows={serviceRows} />
          </div>
        )}
      </div>
    </div>
  )
}
