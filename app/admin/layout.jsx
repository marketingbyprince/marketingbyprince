'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const navItems = [
  { to: '/admin/dashboard',      label: 'Dashboard',     icon: '📊' },
  { to: '/admin/leads',          label: 'Leads',          icon: '📬' },
  { to: '/admin/about',          label: 'About Page',     icon: '👤' },
  { to: '/admin/services',       label: 'Services',       icon: '🎯' },
  { to: '/admin/packages',       label: 'Packages',       icon: '📋' },
  { to: '/admin/platforms',      label: 'Platforms',      icon: '🌐' },
  { to: '/admin/gigs',           label: 'Gigs',           icon: '📦' },
  { to: '/admin/case-studies',   label: 'Case Studies',   icon: '📁' },
  { to: '/admin/articles',       label: 'Articles',       icon: '✍️' },
  { to: '/admin/author',         label: 'Author Profile', icon: '🪪' },
  { to: '/admin/certifications', label: 'Certifications', icon: '🏆' },
  { to: '/admin/media',          label: 'File Manager',   icon: '📂' },
  { to: '/admin/seo',            label: 'SEO Center',     icon: '🔍' },
  { to: '/admin/settings',       label: 'Settings',       icon: '⚙️' },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
      setSession(session)
      setLoading(false)
    })
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--admin-bg)' }}><div className="spinner" /></div>

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--admin-bg)' }}>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r"
             style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>

        <div className="p-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                 style={{ backgroundColor: 'var(--accent)' }}>
              <span className="text-white font-extrabold text-xs">PP</span>
            </div>
            <span className="text-white font-bold text-sm tracking-tight">Marketing By Prince</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              href={to}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to))
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              style={pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to)) ? { backgroundColor: 'var(--accent)' } : {}}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
