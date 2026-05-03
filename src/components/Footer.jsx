import { Link } from 'react-router-dom'

const links = {
  Pages: [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/services', label: 'Services' },
    { to: '/gigs', label: 'Gigs' },
  ],
  Work: [
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/blog', label: 'Blog' },
    { to: '/certifications', label: 'Certifications' },
    { to: '/contact', label: 'Contact' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#111827] border-t border-gray-800 pt-14 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">PP</span>
              </div>
              <span className="text-white font-semibold">Prince Pandey</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Performance Marketer & Key Account Manager. Helping brands grow with data-driven strategies.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://linkedin.com/in/marketingbyprince" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">LinkedIn</a>
              <a href="mailto:marketingbyprince@gmail.com" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Email</a>
              <a href="tel:+919465992412" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Phone</a>
            </div>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-white font-medium text-sm mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {items.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} Prince Pandey. All rights reserved.</p>
          <Link to="/admin/login" className="text-gray-700 hover:text-gray-500 text-xs transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  )
}
