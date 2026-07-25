import SectionHeader from '@/components/ui/SectionHeader'

// content: { eyebrow, title, subtitle }
// data: { testimonials: [...] } — active rows from the testimonials table
export default function TestimonialsSliderSection({ content = {}, data = {} }) {
  const { eyebrow, title, subtitle } = content
  const testimonials = data.testimonials || []
  if (!testimonials.length) return null

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="section-wrap">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} align="center" />

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
          {testimonials.map(t => (
            <div key={t.id} className="card p-6 shrink-0 snap-start flex flex-col" style={{ width: 'min(85vw, 360px)' }}>
              {t.rating && (
                <div className="mb-3" style={{ color: 'var(--accent)' }}>
                  {'★'.repeat(t.rating)}{'☆'.repeat(Math.max(0, 5 - t.rating))}
                </div>
              )}
              <p className="text-body-sm text-gray-600 flex-1 mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: 'var(--accent)' }}>
                    {t.name?.[0] || '?'}
                  </div>
                )}
                <div>
                  <p className="font-bold text-deep text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{[t.role, t.company].filter(Boolean).join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
