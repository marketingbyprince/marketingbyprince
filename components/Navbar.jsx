'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SERVICE_PILLARS } from '@/lib/servicePillars'

const servicesDropdown = [
  ...SERVICE_PILLARS.map(pillar => ({ to: `/services?pillar=${encodeURIComponent(pillar)}`, label: pillar })),
  { to: '/services', label: 'All Services' },
]

const topLinks = [
  { label: 'Home',         to: '/' },
  { label: 'Services',     dropdown: servicesDropdown },
  { label: 'Pricing',      to: '/pricing' },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Portfolio',    to: '/portfolio' },
  { label: 'Insights',     to: '/blog' },
  { label: 'About',        to: '/about' },
  { label: 'Contact',      to: '/contact' },
]

function DropdownMenu({ items, isOpen }) {
  return (
    <div
      className={`absolute top-full left-0 mt-1 min-w-[220px] bg-white border border-gray-100 rounded-lg shadow-lg py-1 transition-all duration-150 z-50 ${
        isOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-1'
      }`}
    >
      {items.map(({ to, label }) => (
        <Link
          key={to}
          href={to}
          className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
        >
          {label}
        </Link>
      ))}
    </div>
  )
}

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [openDrop,  setOpenDrop]  = useState(null)
  const [accordion, setAccordion] = useState(null)
  const pathname = usePathname()
  const dropRef  = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setOpenDrop(null) }, [pathname])

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpenDrop(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        height: scrolled ? '64px' : '80px',
        backgroundColor: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid #F3F4F6' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 3px rgba(17,24,39,0.06)' : 'none',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 h-full flex items-center justify-between" ref={dropRef}>

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <span
            className="text-[#111827] tracking-tight leading-none"
            style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 800, fontSize: '18px' }}
          >
            Prince Pandey
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {topLinks.map((link) => (
            link.dropdown ? (
              <div key={link.label} className="relative">
                <button
                  onClick={() => setOpenDrop(openDrop === link.label ? null : link.label)}
                  onMouseEnter={() => setOpenDrop(link.label)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-[#111827] transition-colors min-h-[44px]"
                >
                  {link.label}
                  <svg className={`w-3.5 h-3.5 transition-transform ${openDrop === link.label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div onMouseLeave={() => setOpenDrop(null)}>
                  <DropdownMenu items={link.dropdown} isOpen={openDrop === link.label} />
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.to}
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors min-h-[44px] flex items-center"
                style={{ color: pathname === link.to ? '#FF6933' : '#6B7280' }}
              >
                {link.label}
              </Link>
            )
          ))}
          <Link
            href="/contact"
            className="ml-3 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all hover:-translate-y-px hover:shadow-lg min-h-[44px] flex items-center"
            style={{ backgroundColor: '#FF6933' }}
          >
            Book Strategy Call
          </Link>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden p-3 rounded-lg transition-colors text-gray-600 hover:text-[#111827] min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 border-t border-gray-100 shadow-lg overflow-y-auto"
          style={{ backgroundColor: '#F9FAFB', maxHeight: 'calc(100vh - 64px)' }}
        >
          <div className="px-4 py-4 space-y-1">
            {topLinks.map((link) => (
              link.dropdown ? (
                <div key={link.label}>
                  <button
                    onClick={() => setAccordion(accordion === link.label ? null : link.label)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold text-[#1F2937] hover:bg-white transition-colors min-h-[44px]"
                  >
                    {link.label}
                    <svg className={`w-4 h-4 transition-transform ${accordion === link.label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {accordion === link.label && (
                    <div className="ml-4 mt-1 space-y-1">
                      {link.dropdown.map(({ to, label }) => (
                        <Link
                          key={to}
                          href={to}
                          className="block px-3 py-2.5 text-sm text-gray-500 hover:text-[#111827] rounded-lg hover:bg-white transition-colors min-h-[44px] flex items-center"
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.to}
                  className="block px-3 py-3 rounded-lg text-sm font-semibold text-[#1F2937] hover:bg-white transition-colors min-h-[44px] flex items-center"
                >
                  {link.label}
                </Link>
              )
            ))}
            <Link
              href="/contact"
              className="block w-full text-center text-white text-sm font-bold px-5 py-3 rounded-lg mt-3 min-h-[44px] flex items-center justify-center"
              style={{ backgroundColor: '#FF6933' }}
            >
              Book Strategy Call
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
