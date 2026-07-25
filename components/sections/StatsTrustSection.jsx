'use client'
import { useState } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'

const TAB_LABELS = { client: 'Clients', platform: 'Platforms', certification: 'Certifications', partner: 'Partners', award: 'Awards' }

// content: { eyebrow, title, subtitle, stats[{label,value}] }
// data: { trustLogos: [{ id, name, logo_url, type, url }] }
export default function StatsTrustSection({ content = {}, data = {} }) {
  const { eyebrow, title, subtitle, stats = [] } = content
  const logos = data.trustLogos || []

  const types = [...new Set(logos.map(l => l.type))]
  const [activeTab, setActiveTab] = useState(types[0])
  const visibleLogos = logos.filter(l => l.type === activeTab)

  if (!stats.length && !logos.length) return null

  return (
    <section className="py-16" style={{ backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
      <div className="section-wrap">
        {title && <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} align="center" />}

        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="font-black text-2xl" style={{ color: 'var(--accent)' }}>{value}</div>
                <div className="text-body-sm text-gray-600 mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}

        {types.length > 0 && (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={activeTab === type ? 'filter-pill-on' : 'filter-pill-off'}
                >
                  {TAB_LABELS[type] || type}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {visibleLogos.map(logo => (
                logo.url ? (
                  <a key={logo.id} href={logo.url} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                    <img src={logo.logo_url} alt={logo.name} className="h-10 object-contain grayscale hover:grayscale-0 transition-all" />
                  </a>
                ) : (
                  <img key={logo.id} src={logo.logo_url} alt={logo.name} className="h-10 object-contain opacity-70 hover:opacity-100 grayscale hover:grayscale-0 transition-all" />
                )
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
