import { Link } from 'react-router-dom'

const links = {
  Pages: [
    { to: '/',         label: 'Home' },
    { to: '/about',    label: 'About' },
    { to: '/services', label: 'Services' },
    { to: '/gigs',     label: 'Gigs' },
  ],
  Work: [
    { to: '/portfolio',      label: 'Portfolio' },
    { to: '/blog',           label: 'Blog' },
    { to: '/certifications', label: 'Certifications' },
    { to: '/contact',        label: 'Contact' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-14 pb-20 md:pb-8">
      <div className="section-wrap">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                   style={{ backgroundColor: 'var(--accent)' }}>
                <span className="text-white font-extrabold text-xs">PP</span>
              </div>
              <span className="text-deep font-extrabold tracking-tight">Prince Pandey</span>
            </div>
            <p className="text-body text-gray-500 max-w-xs leading-relaxed">
              Performance Marketer &amp; Key Account Manager. Helping brands grow with data-driven strategies.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://linkedin.com/in/marketingbyprince" target="_blank" rel="noopener noreferrer"
                 className="text-body-sm text-gray-400 hover:text-accent transition-colors font-semibold">
                LinkedIn
              </a>
              <a href="mailto:marketingbyprince@gmail.com"
                 className="text-body-sm text-gray-400 hover:text-accent transition-colors font-semibold">
                Email
              </a>
              <a href="tel:+919465992412"
                 className="text-body-sm text-gray-400 hover:text-accent transition-colors font-semibold">
                Phone
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-deep font-bold text-sm mb-4 uppercase tracking-wide">{group}</h4>
              <ul className="space-y-2.5">
                {items.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to}
                          className="text-body-sm text-gray-500 hover:text-accent transition-colors font-medium">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="divider pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Prince Pandey. All rights reserved.
          </p>
          <Link to="/admin/login"
                className="text-xs text-gray-300 hover:text-gray-400 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
