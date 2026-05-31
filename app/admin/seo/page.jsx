'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { computeSeoScores, scoreColor, scoreLabel, scoreBg } from '@/lib/seo-scoring'
import SeoOverviewTable from '@/components/admin/seo/SeoOverviewTable'
import SeoScoreCard from '@/components/admin/seo/SeoScoreCard'

const SEO_SECTIONS = [
  { type: 'homepage',     label: 'Homepage',     icon: '🏠', href: '/admin/seo/homepage' },
  { type: 'services',     label: 'Services',     icon: '🎯', href: '/admin/seo/services' },
  { type: 'gigs',         label: 'Gigs',         icon: '📦', href: '/admin/seo/gigs' },
  { type: 'portfolio',    label: 'Portfolio',    icon: '🖼️', href: '/admin/seo/portfolio' },
  { type: 'case_studies', label: 'Case Studies', icon: '📁', href: '/admin/seo/case-studies' },
  { type: 'blogs',        label: 'Blogs',        icon: '✍️', href: '/admin/seo/blogs' },
  { type: 'about',        label: 'About Us',     icon: '👤', href: '/admin/seo/about' },
  { type: null,           label: 'Global Settings', icon: '⚙️', href: '/admin/seo/global' },
]

export default function SeoOverviewPage() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('seo_page_meta').select('*').then(({ data }) => {
      setPages(data || [])
      setLoading(false)
    })
  }, [])

  const avgScore = pages.length
    ? Math.round(pages.reduce((s, p) => s + (p.seo_score || 0), 0) / pages.length)
    : 0

  const missing = {
    title:     pages.filter(p => !p.meta_title).length,
    desc:      pages.filter(p => !p.meta_description).length,
    og:        pages.filter(p => !p.og_image).length,
    schema:    pages.filter(p => !p.schemas || !p.schemas.length).length,
    canonical: pages.filter(p => !p.canonical_url).length,
    faq:       pages.filter(p => !p.ai_faq || !p.ai_faq.length).length,
  }

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

      {/* Site health summary */}
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
          {SEO_SECTIONS.map(({ type, label, icon, href }) => {
            const page = pages.find(p => p.content_type === type)
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

      {/* Overview table */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4">SEO Audit Overview</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : (
          <SeoOverviewTable pages={pages} />
        )}
      </div>
    </div>
  )
}
