import Link from 'next/link'

// content: { title, subtitle, ctaLabel, ctaHref, secondaryLabel?, secondaryHref? }
export default function CTASection({ content = {} }) {
  const {
    title, subtitle,
    ctaLabel = 'Book Strategy Call', ctaHref = '/contact',
    secondaryLabel, secondaryHref,
  } = content
  if (!title) return null

  return (
    <section className="py-20" style={{ backgroundColor: '#111827' }}>
      <div className="section-wrap text-center">
        <h2 className="heading-display mb-4 text-white">{title}</h2>
        {subtitle && <p className="text-body text-gray-300 max-w-xl mx-auto mb-8">{subtitle}</p>}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href={ctaHref} className="btn btn-lg bg-accent text-white hover:bg-accent-dark hover:shadow-accent hover:-translate-y-px active:translate-y-0 inline-flex">
            {ctaLabel}
          </Link>
          {secondaryLabel && (
            <Link href={secondaryHref || '/case-studies'} className="btn btn-lg bg-transparent text-white border border-gray-600 hover:border-accent/60 hover:-translate-y-px active:translate-y-0 inline-flex">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
