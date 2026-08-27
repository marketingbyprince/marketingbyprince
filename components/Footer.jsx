import Link from 'next/link'
import { SERVICE_PILLARS } from '@/lib/servicePillars'

const companyLinks = [
  { to: '/about',          label: 'About' },
  { to: '/case-studies',   label: 'Case Studies' },
  { to: '/contact',        label: 'Contact' },
  { to: '/certifications', label: 'Certifications' },
  { to: '/expertise',      label: 'Expertise' },
  { to: '/careers',        label: 'Careers' },
]

const servicesLinks = [
  { to: `/services?pillar=${encodeURIComponent(SERVICE_PILLARS[0])}`, label: 'Performance Marketing' },
  { to: `/services?pillar=${encodeURIComponent(SERVICE_PILLARS[1])}`, label: 'SEO' },
  { to: `/services?pillar=${encodeURIComponent(SERVICE_PILLARS[2])}`, label: 'Marketplace' },
  { to: `/services?pillar=${encodeURIComponent(SERVICE_PILLARS[3])}`, label: 'Development' },
  { to: `/services?pillar=${encodeURIComponent(SERVICE_PILLARS[5])}`, label: 'Automation' },
  { to: '/pricing', label: 'Pricing' },
]

const resourceLinks = [
  { to: '/blog',   label: 'Insights' },
  { to: '/guides', label: 'Guides' },
  { to: '/faqs',   label: 'FAQs' },
]

const legalLinks = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms',   label: 'Terms' },
  { to: '/cookies', label: 'Cookies' },
]

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4
        className="mb-4 uppercase tracking-wide"
        style={{ color: '#F9FAFB', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em' }}
      >
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map(({ to, label }) => (
          <li key={label}>
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
  )
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#111827' }} className="pt-14 pb-8">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">

          {/* Brand col */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <img
                src="/Media/Logo/marketing-by-prince-icon.png"
                alt="Marketing By Prince"
                width={36}
                height={36}
                className="w-9 h-9 rounded-lg object-cover"
              />
              <span
                className="text-white"
                style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 800, fontSize: '18px' }}
              >
                Prince Pandey
              </span>
            </Link>
            <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: '1.7' }} className="max-w-xs mb-6">
              A complete digital growth partner — performance marketing first, backed by SEO,
              marketplace growth, development, and automation.
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

          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Services" links={servicesLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div
          className="flex justify-center pt-6"
          style={{ borderTop: '1px solid #1F2937' }}
        >
          <p style={{ color: '#6B7280', fontSize: '12px' }}>
            &copy;2026 Prince Pandey. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
