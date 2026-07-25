import SectionHeader from '@/components/ui/SectionHeader'

// content: { eyebrow, title, subtitle, steps[{ number, title, description }] }
export default function ProcessTimelineSection({ content = {} }) {
  const { eyebrow, title, subtitle, steps = [] } = content
  if (!steps.length) return null

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: '#111827' }}>
      <div className="section-wrap">
        <div className="mb-12">
          {eyebrow && <span className="eyebrow mb-3 inline-block" style={{ color: 'var(--accent)' }}>{eyebrow}</span>}
          {title && <h2 className="heading-display text-white mb-4">{title}</h2>}
          {subtitle && <p className="text-body text-gray-400 max-w-2xl">{subtitle}</p>}
        </div>
        <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))' }}>
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-3">
              <span
                className="inline-flex items-center justify-center w-8 h-6 rounded text-xs font-extrabold text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {String(step.number || i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-white font-extrabold text-lg">{step.title}</h3>
              {step.description && <p className="text-body-sm text-gray-400">{step.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
