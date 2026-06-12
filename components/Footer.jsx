import Link from 'next/link'

const pageLinks = [
  { to: '/',         label: 'Home' },
  { to: '/about',    label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/pricing',  label: 'Pricing' },
  { to: '/blog',     label: 'Insights' },
  { to: '/contact',  label: 'Contact' },
]

const workLinks = [
  { to: '/portfolio',    label: 'Portfolio' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/certifications', label: 'Certifications' },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#111827' }} className="pt-14 pb-8">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand col */}
          <div className="sm:col-span-2">
            <Link href="/" className="block mb-4">
              <span
                className="text-white"
                style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 800, fontSize: '18px' }}
              >
                Prince Pandey
              </span>
            </Link>
            <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: '1.7' }} className="max-w-xs mb-6">
              Helping brands grow with data-driven performance marketing.
            </p>
            <div className="flex gap-5">
              <a
                href="https://linkedin.com/in/marketingbyprince"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 500 }}
                className="hover:text-[#FF6933] transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="mailto:marketingbyprince@gmail.com"
                style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 500 }}
                className="hover:text-[#FF6933] transition-colors"
              >
                Email
              </a>
              <a
                href="tel:+919465992412"
                style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 500 }}
                className="hover:text-[#FF6933] transition-colors"
              >
                Phone
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4
              className="mb-4 uppercase tracking-wide"
              style={{ color: '#F9FAFB', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em' }}
            >
              Pages
            </h4>
            <ul className="space-y-2.5">
              {pageLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    href={to}
                    style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 500 }}
                    className="hover:text-[#FF6933] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Work */}
          <div>
            <h4
              className="mb-4 uppercase tracking-wide"
              style={{ color: '#F9FAFB', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em' }}
            >
              Work
            </h4>
            <ul className="space-y-2.5">
              {workLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    href={to}
                    style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 500 }}
                    className="hover:text-[#FF6933] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6"
          style={{ borderTop: '1px solid #1F2937' }}
        >
          <p style={{ color: '#6B7280', fontSize: '12px' }}>
            &copy;2026 Prince Pandey. All rights reserved.
          </p>
          <Link
            href="/admin/login"
            style={{ color: '#374151', fontSize: '11px' }}
            className="hover:text-gray-500 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
