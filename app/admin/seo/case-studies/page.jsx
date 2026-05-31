'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { scoreColor, scoreLabel } from '@/lib/seo-scoring'

function ScoreBadge({ score }) {
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ color: scoreColor(score || 0), backgroundColor: scoreColor(score || 0) + '18' }}>
      {score || 0} · {scoreLabel(score || 0)}
    </span>
  )
}

export default function CaseStudiesSeoListPage() {
  const [cases, setCases] = useState([])
  const [seoMap, setSeoMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('case_studies').select('id, title, client_name, industry, is_published').order('created_at', { ascending: false }),
      supabase.from('seo_page_meta').select('content_id, seo_score, meta_title, meta_description, og_image, schemas').eq('content_type', 'case_study'),
    ]).then(([{ data: casesData }, { data: seoData }]) => {
      setCases(casesData || [])
      const map = {}
      ;(seoData || []).forEach(s => { map[s.content_id] = s })
      setSeoMap(map)
      setLoading(false)
    })
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link href="/admin/seo" className="hover:text-white">SEO Center</Link>
          <span>›</span>
          <span className="text-white">Case Studies</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Case Studies SEO</h1>
        <p className="text-sm text-gray-400 mt-1">Manage SEO for each individual case study</p>
      </div>
      {loading ? (
        <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
      ) : cases.length === 0 ? (
        <div className="text-gray-500 text-sm py-10 text-center">No case studies found.</div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--admin-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
                {['Case Study', 'Industry', 'SEO Score', 'Title', 'Desc', 'OG', 'Schema', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cases.map(c => {
                const seo = seoMap[c.id] || {}
                const Check = ({ ok }) => <span className={ok ? 'text-green-500' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-white/3 transition-colors"
                      style={{ borderColor: 'var(--admin-border)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.client_name}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{c.industry || '—'}</td>
                    <td className="px-4 py-3"><ScoreBadge score={seo.seo_score} /></td>
                    <td className="px-4 py-3"><Check ok={Boolean(seo.meta_title)} /></td>
                    <td className="px-4 py-3"><Check ok={Boolean(seo.meta_description)} /></td>
                    <td className="px-4 py-3"><Check ok={Boolean(seo.og_image)} /></td>
                    <td className="px-4 py-3"><Check ok={Array.isArray(seo.schemas) && seo.schemas.length > 0} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/seo/case-studies/${c.id}`}
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
  )
}
