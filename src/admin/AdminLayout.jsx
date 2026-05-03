import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/leads', label: 'Leads', icon: '📬' },
  { to: '/admin/services', label: 'Services', icon: '🎯' },
  { to: '/admin/gigs', label: 'Gigs', icon: '📦' },
  { to: '/admin/case-studies', label: 'Case Studies', icon: '📁' },
  { to: '/admin/articles', label: 'Articles', icon: '✍️' },
  { to: '/admin/certifications', label: 'Certifications', icon: '🏆' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-[#111827] border-r border-gray-800 shrink-0">
        <div className="p-4 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">PP</span>
            </div>
            <span className="text-white font-semibold text-sm">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                location.pathname === to
                  ? 'bg-blue-500/15 text-blue-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-base">{icon}</span> {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#111827] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link to="/admin/dashboard" className="text-white font-semibold text-sm">Admin Panel</Link>
        <button onClick={handleLogout} className="text-gray-400 text-xs hover:text-red-400 transition-colors">Log Out</button>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto pt-0 md:pt-0">
        <div className="md:hidden h-14" />
        {children}
      </main>
    </div>
  )
}
