import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navItems = [
  { to: '/admin/dashboard',      label: 'Dashboard',     icon: '📊' },
  { to: '/admin/leads',          label: 'Leads',          icon: '📬' },
  { to: '/admin/about',          label: 'About Page',     icon: '👤' },
  { to: '/admin/services',       label: 'Services',       icon: '🎯' },
  { to: '/admin/packages',       label: 'Packages',       icon: '📋' },
  { to: '/admin/addons',         label: 'Add-ons',        icon: '🧩' },
  { to: '/admin/platforms',      label: 'Platforms',      icon: '🌐' },
  { to: '/admin/gigs',           label: 'Gigs',           icon: '📦' },
  { to: '/admin/case-studies',   label: 'Case Studies',   icon: '📁' },
  { to: '/admin/articles',       label: 'Articles',       icon: '✍️' },
  { to: '/admin/certifications', label: 'Certifications', icon: '🏆' },
  { to: '/admin/media',          label: 'Media',          icon: '🖼️' },
  { to: '/admin/settings',       label: 'Settings',       icon: '⚙️' },
]

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--admin-bg)' }}>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r"
             style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>

        <div className="p-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                 style={{ backgroundColor: 'var(--accent)' }}>
              <span className="text-white font-extrabold text-xs">PP</span>
            </div>
            <span className="text-white font-bold text-sm tracking-tight">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                location.pathname === to
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">{icon}</span> {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 border-b px-4 py-3 flex items-center justify-between"
           style={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>
        <Link to="/admin/dashboard" className="text-white font-bold text-sm">Admin Panel</Link>
        <button onClick={handleLogout}
                className="text-gray-400 text-xs hover:text-red-400 transition-colors font-semibold">
          Log Out
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="md:hidden h-14" />
        {children}
      </main>

    </div>
  )
}
