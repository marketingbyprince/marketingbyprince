'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { to: '/',               label: 'Home' },
  { to: '/about',          label: 'About' },
  { to: '/services',       label: 'Services' },
  { to: '/gigs',           label: 'Gigs' },
  { to: '/portfolio',      label: 'Portfolio' },
  { to: '/blog',           label: 'Blog' },
  { to: '/certifications', label: 'Certs' },
]

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white border-b border-gray-200 shadow-card'
        : 'bg-white/80 backdrop-blur-md'
    }`}>
      <div className="section-wrap">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                 style={{ backgroundColor: 'var(--accent)' }}>
              <span className="text-white font-extrabold text-xs">PP</span>
            </div>
            <span className="text-deep font-extrabold text-base hidden sm:block tracking-tight">
              Prince Pandey
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                href={to}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pathname === to
                    ? 'text-accent'
                    : 'text-gray-500 hover:text-deep'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link href="/contact" className="ml-3 btn-primary btn-md">
              Let&apos;s Talk
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden text-gray-500 hover:text-deep p-2 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                pathname === to
                  ? 'text-accent bg-accent-muted'
                  : 'text-gray-500 hover:text-deep hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link href="/contact" className="block w-full text-center btn-primary btn-md mt-2">
            Let&apos;s Talk
          </Link>
        </div>
      )}
    </nav>
  )
}
