'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { scoreColor, scoreLabel } from '@/lib/seo-scoring'
import SeoScoreCard from '@/components/admin/seo/SeoScoreCard'

function ScoreBadge({ score }) {
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ color: scoreColor(score || 0), backgroundColor: scoreColor(score || 0) + '18' }}>
      {score || 0} · {scoreLabel(score || 0)}
    </span>
  )
}

export default function GigsSeoListPage() {
  const [gigs, setGigs] = useState([])
  const [seoMap, setSeoMap] = useState({})
  const [pageSeo, setPageSeo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('gigs').select('id, title, category, is_active').order('created_at', { ascending: false }),
      supabase.from('seo_page_meta').select('content_id, seo_score, meta_title, meta_description, og_image, schemas').eq('content_type', 'gig'),
      supabase.from('seo_page_meta').select('seo_score, meta_title, meta_description, og_image, schemas').eq('content_type', 'gigs').is('content_id', null).single(),
    ]).then(([{ data: gigsData }, { data: seoData }, { data: pageData }]) => {
      setGigs(gigsData || [])
      const map = {}
      ;(seoData || []).forEach(s => { map[s.content_id] = s })
      setSeoMap(map)
      setPageSeo(pageData)
      setLoading(false)
    })
  }, [])

  const Check = ({ ok }) => <span className={ok ? 'text-green-500' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Breadcrumb + header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link href="/admin/seo" className="hover:text-white">SEO Center</Link>
          <span>›</span>
          <span className="text-white">Gigs</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Gigs SEO</h1>
      </div>

      {/* ── Gigs Listing Page SEO ── */}
      <div className="rounded-2xl border p-5 flex items-center justify-between gap-6"
           style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
        <div className="flex items-center gap-5">
          <SeoScoreCard label="Page Score" score={pageSeo?.seo_score || 0} />
          <div>
            <p className="text-white font-bold">Gigs Listing Page</p>
            <p className="text-xs text-gray-400 mt-0.5">SEO for the main <code className="text-orange-400">/gigs</code> page</p>
            <div className="flex gap-3 mt-2 text-xs">
              <span>Title <Check ok={Boolean(pageSeo?.meta_title)} /></span>
              <span>Desc <Check ok={Boolean(pageSeo?.meta_description)} /></span>
              <span>OG <Check ok={Boolean(pageSeo?.og_image)} /></span>
              <span>Schema <Check ok={Array.isArray(pageSeo?.schemas) && pageSeo.schemas.length > 0} /></span>
            </div>
          </div>
        </div>
        <Link href="/admin/seo/gigs/page-seo"
              className="shrink-0 text-sm font-bold px-4 py-2 rounded-xl text-white"
              style={{ backgroundColor: 'var(--accent)' }}>
          Edit Page SEO
        </Link>
      </div>

      {/* ── Individual Gigs ── */}
      <div>
        <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3">Individual Gigs</h2>
        {loading ? (
          <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
        ) : gigs.length === 0 ? (
          <div className="text-gray-500 text-sm py-10 text-center">No gigs found. Add gigs first.</div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--admin-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
                  {['Gig', 'Category', 'SEO Score', 'Title', 'Desc', 'OG', 'Schema', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gigs.map(g => {
                  const seo = seoMap[g.id] || {}
                  return (
                    <tr key={g.id} className="border-b last:border-0 hover:bg-white/3 transition-colors"
                        style={{ borderColor: 'var(--admin-border)' }}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{g.title}</p>
                        <p className="text-xs text-gray-500">{g.is_active ? '● Active' : '○ Inactive'}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{g.category || '—'}</td>
                      <td className="px-4 py-3"><ScoreBadge score={seo.seo_score} /></td>
                      <td className="px-4 py-3"><Check ok={Boolean(seo.meta_title)} /></td>
                      <td className="px-4 py-3"><Check ok={Boolean(seo.meta_description)} /></td>
                      <td className="px-4 py-3"><Check ok={Boolean(seo.og_image)} /></td>
                      <td className="px-4 py-3"><Check ok={Array.isArray(seo.schemas) && seo.schemas.length > 0} /></td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/seo/gigs/${g.id}`}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                              style={{ backgroundColor: 'var(--accent)' }}>
                          Edit SEO
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
