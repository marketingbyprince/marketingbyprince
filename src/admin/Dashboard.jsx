import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminLayout from './AdminLayout'

const quickLinks = [
  { to: '/admin/leads', label: 'View Leads', icon: '📬' },
  { to: '/admin/services', label: 'Manage Services', icon: '🎯' },
  { to: '/admin/gigs', label: 'Manage Gigs', icon: '📦' },
  { to: '/admin/case-studies', label: 'Case Studies', icon: '📁' },
  { to: '/admin/articles', label: 'Write Article', icon: '✍️' },
  { to: '/admin/certifications', label: 'Certifications', icon: '🏆' },
  { to: '/admin/settings', label: 'Site Settings', icon: '⚙️' },
]

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
        leads: leads.count || 0,
        articles: articles.count || 0,
        gigs: gigs.count || 0,
        cases: cases.count || 0,
        unread: unread.count || 0,
      })
    })
  }, [])

  const statCards = [
    { label: 'Total Leads', value: stats.leads, sub: `${stats.unread} unread`, color: 'text-blue-400' },
    { label: 'Published Articles', value: stats.articles, color: 'text-green-400' },
    { label: 'Active Gigs', value: stats.gigs, color: 'text-purple-400' },
    { label: 'Case Studies', value: stats.cases, color: 'text-yellow-400' },
  ]

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Overview of your portfolio content</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map(s => (
            <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-xl p-5">
              <div className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-white text-sm font-medium">{s.label}</div>
              {s.sub && <div className="text-gray-500 text-xs mt-0.5">{s.sub}</div>}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-white font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {quickLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2.5 p-4 bg-[#111827] border border-gray-800 rounded-xl hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-gray-300 hover:text-white text-sm"
              >
                <span>{icon}</span> {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex items-center gap-4">
          <span className="text-2xl">🌐</span>
          <div>
            <p className="text-white font-medium text-sm">View live site</p>
            <Link to="/" className="text-blue-400 text-xs hover:underline">Open portfolio →</Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
