import { useLocation, useNavigate } from 'react-router-dom'

const routeLabels = {
  '/': "Let's Talk",
  '/services': 'Get Quote',
  '/gigs': 'Order Now',
  '/portfolio': 'Book a Call',
  '/blog': 'Subscribe',
  '/contact': 'Send Message',
}

export default function MobileBottomCTA() {
  const location = useLocation()
  const navigate = useNavigate()

  if (location.pathname.startsWith('/admin')) return null

  const ctaLabel = routeLabels[location.pathname] || "Let's Talk"

  const handleForm = () => {
    if (location.pathname === '/contact') {
      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/contact')
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-gray-800 px-4 py-3 safe-area-bottom">
      <div className="flex gap-3 justify-center">
        <a
          href="tel:+919465992412"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-800/80 text-gray-200 text-sm font-medium transition-all active:scale-95"
        >
          <span>📞</span> Call
        </a>
        <a
          href="mailto:marketingbyprince@gmail.com"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-800/80 text-gray-200 text-sm font-medium transition-all active:scale-95"
        >
          <span>✉</span> Email
        </a>
        <button
          onClick={handleForm}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold transition-all active:scale-95"
        >
          <span>📋</span> {ctaLabel}
        </button>
      </div>
    </div>
  )
}
