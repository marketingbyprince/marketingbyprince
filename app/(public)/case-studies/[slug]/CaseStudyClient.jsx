import Link from 'next/link'
import MetricsTable from '@/components/case-studies/MetricsTable'
import ScreenshotGallery from '@/components/case-studies/ScreenshotGallery'
import PdfViewer from '@/components/case-studies/PdfViewer'
import RelatedProjects from '@/components/case-studies/RelatedProjects'
import PrevNextNav from '@/components/case-studies/PrevNextNav'

const sectionDefs = [
  { label: 'The Challenge', icon: '🎯', key: 'challenge' },
  { label: 'Objective',     icon: '🧭', key: 'objective' },
  { label: 'Strategy',      icon: '🗺️', key: 'strategy'  },
  { label: 'Execution',     icon: '⚡', key: 'execution' },
  { label: 'Results',       icon: '📈', key: 'results'   },
]

export default function CaseStudyClient({ initial }) {
  const cs      = initial?.cs ?? null
  const others  = initial?.others ?? []
  const ordered = initial?.ordered ?? []

  if (!cs) return (
    <div className="min-h-screen flex items-center justify-center bg-soft">
      <div className="text-center">
        <p className="text-body text-gray-500 mb-4">Case study not found.</p>
        <Link href="/case-studies" className="text-body-sm font-bold" style={{ color: 'var(--accent)' }}>
          &larr; Back to Case Studies
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link href="/case-studies"
              className="text-body-sm font-semibold text-gray-400 hover:text-accent flex items-center gap-1 mb-8 transition-colors">
          &larr; Back to Case Studies
        </Link>

        {cs.cover_image_url && (
          <img src={cs.cover_image_url} alt={cs.title}
               className="w-full h-64 object-cover rounded-2xl mb-10 shadow-card" />
        )}

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {cs.industry && <span className="badge-accent">{cs.industry}</span>}
            {cs.channel && <span className="badge-accent">{cs.channel}</span>}
            {cs.is_featured && <span className="badge-warn">Featured</span>}
          </div>
          <h1 className="heading-display text-deep mb-3">{cs.title}</h1>
          {cs.summary && <p className="text-body text-gray-500 max-w-2xl">{cs.summary}</p>}
        </div>

        {/* Project overview */}
        <div className="card p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {cs.client_name && (
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Client</div>
              <div className="text-sm font-bold text-deep">{cs.client_name}</div>
            </div>
          )}
          {cs.industry && (
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Industry</div>
              <div className="text-sm font-bold text-deep">{cs.industry}</div>
            </div>
          )}
          {cs.channel && (
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Channel</div>
              <div className="text-sm font-bold text-deep">{cs.channel}</div>
            </div>
          )}
          {cs.duration && (
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Timeline</div>
              <div className="text-sm font-bold text-deep">{cs.duration}</div>
            </div>
          )}
        </div>

        {cs.key_metrics && Object.keys(cs.key_metrics).length > 0 && (
          <div className="card-elevated p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {Object.entries(cs.key_metrics).map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="text-price-val mb-1" style={{ color: 'var(--accent)' }}>{v}</div>
                <div className="text-body-sm text-gray-500 font-medium">{k}</div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-10">
          {sectionDefs.filter(s => cs[s.key]).map(section => (
            <div key={section.label}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-xl">{section.icon}</span>
                <h2 className="heading-section">{section.label}</h2>
              </div>
              <div className="card p-6">
                <div
                  className="prose-rte"
                  dangerouslySetInnerHTML={{ __html: cs[section.key] || '' }}
                />
              </div>
            </div>
          ))}

          {cs.metrics_table && (
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-xl">📊</span>
                <h2 className="heading-section">Performance Over Time</h2>
              </div>
              <MetricsTable data={cs.metrics_table} />
            </div>
          )}

          <ScreenshotGallery screenshots={cs.screenshots || []} title="Campaign Evidence" />

          <PdfViewer pdfUrl={cs.pdf_url} title={cs.title} />
        </div>

        <div className="mt-14 rounded-2xl p-8 text-center"
             style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
          <h3 className="heading-section mb-2">Have a Similar Challenge?</h3>
          <p className="text-body text-gray-500 mb-6">Let&rsquo;s build a strategy for your brand.</p>
          <Link href="/contact" className="btn-primary btn-lg">Start a Conversation</Link>
        </div>

        {ordered.length > 1 && (
          <div className="mt-14">
            <PrevNextNav currentId={cs.id} ordered={ordered} />
          </div>
        )}

        {others.length > 0 && (
          <div className="mt-16">
            <RelatedProjects current={cs} others={others} />
          </div>
        )}

      </div>
    </div>
  )
}
