'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const quickLinks = [
  { to: '/admin/leads',         label: 'View Leads',      icon: '📬' },
  { to: '/admin/services',      label: 'Manage Services', icon: '🎯' },
  { to: '/admin/gigs',          label: 'Manage Gigs',     icon: '📦' },
  { to: '/admin/case-studies',  label: 'Case Studies',    icon: '📁' },
  { to: '/admin/articles',      label: 'Write Article',   icon: '✍️' },
  { to: '/admin/certifications',label: 'Certifications',  icon: '🏆' },
  { to: '/admin/settings',      label: 'Site Settings',   icon: '⚙️' },
]

const statColors = {
  leads:    'text-accent',
  articles: 'text-green-400',
  gigs:     'text-purple-400',
  cases:    'text-yellow-400',
}

export default function Dashboard() {
  const [stats, setStats] = useState({ leads: 0, articles: 0, gigs: 0, cases: 0, unread: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from('leads').select('id, is_read', { count: 'exact' }),
      supabase.from('articles').select('id', { count: 'exact' }).eq('is_published', true),
      supabase.from('gigs').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('case_studies').select('id', { count: 'exact' }).eq('is_published', true),
      supabase.from('leads').select('id', { count: 'exact' }).eq('is_read', false),
    ]).then(([leads, articles, gigs, cases, unread]) => {
      setStats({
        leads:   leads.count   || 0,
        articles:articles.count|| 0,
        gigs:    gigs.count    || 0,
        cases:   cases.count   || 0,
        unread:  unread.count  || 0,
      })
    })
  }, [])

  const statCards = [
    { key: 'leads',    label: 'Total Leads',        value: stats.leads,    sub: `${stats.unread} unread` },
    { key: 'articles', label: 'Published Articles',  value: stats.articles  },
    { key: 'gigs',     label: 'Active Gigs',         value: stats.gigs      },
    { key: 'cases',    label: 'Case Studies',         value: stats.cases     },
  ]

  return (
    <div className="p-6 sm:p-8">

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of your site content</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(s => (
          <div key={s.key} className="admin-card rounded-xl p-5">
            <div className={`text-3xl font-black mb-1 ${statColors[s.key]}`}>{s.value}</div>
            <div className="text-white text-sm font-semibold">{s.label}</div>
            {s.sub && <div className="text-gray-500 text-xs mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-6">
        <h2 className="text-white font-bold text-sm uppercase tracking-wide mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              href={to}
              className="flex items-center gap-2.5 p-4 admin-card rounded-xl hover:border-accent/40 hover:bg-accent/5 transition-all text-gray-300 hover:text-white text-sm font-semibold"
            >
              <span>{icon}</span> {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Live site link */}
      <div className="rounded-xl p-5 flex items-center gap-4 border"
           style={{ backgroundColor: 'rgba(255,105,51,0.07)', borderColor: 'rgba(255,105,51,0.2)' }}>
        <span className="text-2xl">🌐</span>
        <div>
          <p className="text-white font-semibold text-sm">View live site</p>
          <Link href="/" className="text-accent text-xs hover:underline font-medium">
            Open live site &rarr;
          </Link>
        </div>
      </div>

    </div>
  )
}
