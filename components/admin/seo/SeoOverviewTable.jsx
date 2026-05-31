'use client'
import Link from 'next/link'
import { scoreColor, scoreLabel } from '@/lib/seo-scoring'

const PAGE_ROUTES = {
  homepage:     '/admin/seo/homepage',
  services:     '/admin/seo/services',
  gigs:         '/admin/seo/gigs',
  portfolio:    '/admin/seo/portfolio',
  case_studies: '/admin/seo/case-studies',
  blogs:        '/admin/seo/blogs',
  about:        '/admin/seo/about',
}

const PAGE_LABELS = {
  homepage:     'Homepage',
  services:     'Services',
  gigs:         'Gigs',
  portfolio:    'Portfolio',
  case_studies: 'Case Studies',
  blogs:        'Blogs',
  about:        'About Us',
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

function Check({ ok }) {
  return <span className={ok ? 'text-green-500' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>
}

export default function SeoOverviewTable({ pages = [] }) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--admin-border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
            {['Page','SEO Score','Title','Desc','OG','Canonical','Schema','FAQ/AI',''].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.content_type} className="border-b last:border-0 hover:bg-white/3 transition-colors"
                style={{ borderColor: 'var(--admin-border)' }}>
              <td className="px-4 py-3 font-medium text-white">
                {PAGE_LABELS[p.content_type] || p.content_type}
              </td>
              <td className="px-4 py-3"><ScorePill score={p.seo_score || 0} /></td>
              <td className="px-4 py-3"><Check ok={Boolean(p.meta_title)} /></td>
              <td className="px-4 py-3"><Check ok={Boolean(p.meta_description)} /></td>
              <td className="px-4 py-3"><Check ok={Boolean(p.og_image)} /></td>
              <td className="px-4 py-3"><Check ok={Boolean(p.canonical_url)} /></td>
              <td className="px-4 py-3"><Check ok={Array.isArray(p.schemas) && p.schemas.length > 0} /></td>
              <td className="px-4 py-3"><Check ok={Array.isArray(p.ai_faq) && p.ai_faq.length > 0} /></td>
              <td className="px-4 py-3">
                <Link href={PAGE_ROUTES[p.content_type] || '#'}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
