'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase as supabaseAdmin } from '@/lib/supabase'
import AdminPageShell from '@/components/admin/AdminPageShell'

const FIELDS = 'id, title, client_name, industry, channel, cover_image_url, portfolio_url, is_published, is_featured, sort_order'

// Portfolio has no table of its own — it's a curated, ordered subset of
// case_studies (is_featured = true, ordered by sort_order). This page is a
// focused view over that same data just for curating what shows on
// /portfolio and in what order; full case study content is still edited
// under Case Studies.
export default function ManagePortfolio() {
  const [cases,   setCases]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const fetchData = async () => {
    const { data, error: err } = await supabaseAdmin.from('case_studies').select(FIELDS)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    setCases(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const published = cases.filter(c => c.is_published)
  const unpublished = cases.filter(c => !c.is_published)
  const featured = published.filter(c => c.is_featured)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const available = published.filter(c => !c.is_featured)

  const addToPortfolio = async c => {
    const nextOrder = featured.length
      ? Math.max(...featured.map(f => f.sort_order ?? 0)) + 1
      : 0
    setError('')
    const { error: err } = await supabaseAdmin.from('case_studies')
      .update({ is_featured: true, sort_order: nextOrder }).eq('id', c.id)
    if (err) { setError(err.message); return }
    setCases(prev => prev.map(x => x.id === c.id ? { ...x, is_featured: true, sort_order: nextOrder } : x))
  }

  const removeFromPortfolio = async c => {
    setError('')
    const { error: err } = await supabaseAdmin.from('case_studies')
      .update({ is_featured: false }).eq('id', c.id)
    if (err) { setError(err.message); return }
    setCases(prev => prev.map(x => x.id === c.id ? { ...x, is_featured: false } : x))
  }

  const move = async (c, direction) => {
    const idx = featured.findIndex(f => f.id === c.id)
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= featured.length) return
    const other = featured[swapIdx]
    setError('')
    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabaseAdmin.from('case_studies').update({ sort_order: other.sort_order ?? swapIdx }).eq('id', c.id),
      supabaseAdmin.from('case_studies').update({ sort_order: c.sort_order ?? idx }).eq('id', other.id),
    ])
    if (err1 || err2) { setError((err1 || err2).message); return }
    setCases(prev => prev.map(x => {
      if (x.id === c.id) return { ...x, sort_order: other.sort_order ?? swapIdx }
      if (x.id === other.id) return { ...x, sort_order: c.sort_order ?? idx }
      return x
    }))
  }

  return (
    <AdminPageShell title="Portfolio" count={featured.length}>
      <p className="text-gray-500 text-sm -mt-4 mb-8">
        Curate which published case studies appear on <Link href="/portfolio" target="_blank" className="underline hover:text-white">/portfolio</Link> and in what order.
        To edit a case study's content, use <Link href="/admin/case-studies" className="underline hover:text-white">Case Studies</Link>.
      </p>

      {error && <p className="text-sm text-red-400 font-semibold mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <>
          <div className="mb-10">
            <SectionLabel hint="Shown on /portfolio in this order.">In Portfolio</SectionLabel>
            {featured.length === 0 ? (
              <p className="text-gray-500 text-sm bg-white/5 rounded-xl px-5 py-4">
                Nothing curated yet — the public page falls back to showing every published case study.
                Add some below.
              </p>
            ) : (
              <div className="space-y-2">
                {featured.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 admin-card rounded-xl px-5 py-3.5">
                    <div className="flex flex-col shrink-0">
                      <button disabled={i === 0} onClick={() => move(c, -1)}
                              className="text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 leading-none px-1">▲</button>
                      <button disabled={i === featured.length - 1} onClick={() => move(c, 1)}
                              className="text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 leading-none px-1">▼</button>
                    </div>
                    {c.cover_image_url ? (
                      <img src={c.cover_image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-lg shrink-0">📊</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{c.title}</p>
                      <p className="text-gray-500 text-xs truncate">{c.client_name}{c.channel ? ` · ${c.channel}` : ''}</p>
                    </div>
                    <button onClick={() => removeFromPortfolio(c)}
                            className="text-xs px-3 py-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 font-semibold">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionLabel hint="Published case studies not currently on the Portfolio page.">Available Case Studies</SectionLabel>
            {available.length === 0 ? (
              <p className="text-gray-500 text-sm bg-white/5 rounded-xl px-5 py-4">Nothing left to add — every published case study is already in the portfolio.</p>
            ) : (
              <div className="space-y-2">
                {available.map(c => (
                  <div key={c.id} className="flex items-center gap-3 admin-card rounded-xl px-5 py-3.5">
                    {c.cover_image_url ? (
                      <img src={c.cover_image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-lg shrink-0">📊</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{c.title}</p>
                      <p className="text-gray-500 text-xs truncate">{c.client_name}{c.channel ? ` · ${c.channel}` : ''}</p>
                    </div>
                    <button onClick={() => addToPortfolio(c)}
                            className="btn-admin btn-sm shrink-0">
                      + Add to Portfolio
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {unpublished.length > 0 && (
            <p className="text-gray-600 text-xs mt-8">
              {unpublished.length} draft case {unpublished.length === 1 ? 'study' : 'studies'} not shown — publish {unpublished.length === 1 ? 'it' : 'them'} in Case Studies first.
            </p>
          )}
        </>
      )}
    </AdminPageShell>
  )
}

function SectionLabel({ children, hint }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">{children}</p>
      {hint && <p className="text-xs text-gray-600 mt-0.5">{hint}</p>}
    </div>
  )
}
