'use client'
import { usePathname, useRouter } from 'next/navigation'

const routeLabels = {
  '/':          "Let's Talk",
  '/services':  'Get Quote',
  '/pricing':   'Order Now',
  '/blog':      'Subscribe',
  '/contact':   'Send Message',
}

export default function MobileBottomCTA() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname.startsWith('/admin')) return null

  const ctaLabel = routeLabels[pathname] || "Let's Talk"

  const handleForm = () => {
    if (pathname === '/contact') {
      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push('/contact')
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-gray-200 px-4 py-3">
      <div className="flex gap-2.5 justify-center">
        <a
          href="tel:+919465992412"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-deep text-sm font-semibold transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call
        </a>
        <a
          href="mailto:marketingbyprince@gmail.com"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-deep text-sm font-semibold transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email
        </a>
        <button
          onClick={handleForm}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}
