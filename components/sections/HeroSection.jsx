import Link from 'next/link'

// content: { eyebrow, title, subtitle, ctaLabel, ctaHref, secondaryLabel, secondaryHref, backgroundImage }
export default function HeroSection({ content = {} }) {
  const {
    eyebrow, title, subtitle,
    ctaLabel, ctaHref = '/contact',
    secondaryLabel, secondaryHref,
    backgroundImage,
  } = content

  if (!title) return null

  return (
    <section
      className="relative pt-40 pb-24"
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(17,24,39,0.72), rgba(17,24,39,0.72)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : { backgroundColor: '#111827' }}
    >
      <div className="section-wrap text-center">
        {eyebrow && (
          <span className="eyebrow mb-4 inline-block" style={{ color: 'var(--accent)' }}>{eyebrow}</span>
        )}
        <h1 className="heading-display mb-6 text-white max-w-4xl mx-auto">{title}</h1>
        {subtitle && (
          <p className="text-body text-gray-300 max-w-2xl mx-auto mb-10">{subtitle}</p>
        )}
        {(ctaLabel || secondaryLabel) && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {ctaLabel && (
              <Link href={ctaHref} className="btn btn-lg bg-accent text-white hover:bg-accent-dark hover:shadow-accent hover:-translate-y-px active:translate-y-0">
                {ctaLabel}
              </Link>
            )}
            {secondaryLabel && secondaryHref && (
              <Link href={secondaryHref} className="btn btn-lg bg-white text-deep border border-gray-200 hover:border-accent/40 hover:-translate-y-px active:translate-y-0">
                {secondaryLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
