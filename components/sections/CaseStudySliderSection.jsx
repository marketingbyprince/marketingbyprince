import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'

// content: { eyebrow, title, subtitle, ctaLabel, ctaHref }
// data: { caseStudies: [...] } — featured case_studies, resolved by lib/pages.js
export default function CaseStudySliderSection({ content = {}, data = {} }) {
  const { eyebrow, title, subtitle, ctaLabel = 'View All Case Studies', ctaHref = '/case-studies' } = content
  const cases = data.caseStudies || []
  if (!cases.length) return null

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
      <div className="section-wrap">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
          <Link href={ctaHref} className="text-body-sm font-bold shrink-0 mb-12" style={{ color: 'var(--accent)' }}>
            {ctaLabel} &rarr;
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
          {cases.map(c => (
            <Link
              key={c.id}
              href={`/case-studies/${c.id}`}
              className="card-interactive overflow-hidden shrink-0 snap-start"
              style={{ width: 'min(85vw, 340px)' }}
            >
              {c.cover_image_url ? (
                <img src={c.cover_image_url} alt={c.title} className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 flex items-center justify-center text-4xl" style={{ background: 'var(--accent-muted)' }}>📊</div>
              )}
              <div className="p-6">
                <span className="badge-accent mb-3 inline-block">{c.industry}</span>
                <h3 className="heading-section mb-1.5">{c.title}</h3>
                <p className="text-body-sm text-gray-500 mb-4">{c.client_name}</p>
                {c.key_metrics && Object.keys(c.key_metrics).length > 0 && (
                  <div className="flex gap-4">
                    {Object.entries(c.key_metrics).slice(0, 2).map(([k, v]) => (
                      <div key={k}>
                        <div className="font-black text-lg" style={{ color: 'var(--accent)' }}>{v}</div>
                        <div className="text-xs text-gray-500">{k}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
