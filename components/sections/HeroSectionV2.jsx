import Link from 'next/link'

// content: { eyebrow, title, subtitle, primaryCta{label,href}, secondaryCta{label,href},
//            trustStripLabel, trustStripItems[string], dashboardStats[{label,value}] }
export default function HeroSectionV2({ content = {} }) {
  const {
    eyebrow, title, subtitle,
    primaryCta, secondaryCta,
    trustStripLabel, trustStripItems = [],
    dashboardStats = [],
  } = content

  if (!title) return null

  return (
    <section className="w-full pt-32 pb-16 lg:pt-40 lg:pb-24" style={{ backgroundColor: '#fff' }}>
      <div className="section-wrap grid lg:grid-cols-2 gap-12 items-center">
        <div>
          {eyebrow && (
            <span
              className="inline-block mb-4 text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--accent)' }}
            >
              {eyebrow}
            </span>
          )}
          <h1 className="heading-display mb-5">{title}</h1>
          {subtitle && <p className="text-body text-gray-500 mb-8 max-w-xl">{subtitle}</p>}

          {(primaryCta?.label || secondaryCta?.label) && (
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {primaryCta?.label && (
                <Link href={primaryCta.href || '/contact'} className="btn btn-lg bg-accent text-white hover:bg-accent-dark hover:shadow-accent hover:-translate-y-px active:translate-y-0">
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta?.label && (
                <Link href={secondaryCta.href || '/case-studies'} className="btn btn-lg bg-white text-deep border border-gray-200 hover:border-accent/40 hover:-translate-y-px active:translate-y-0">
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}

          {trustStripItems.length > 0 && (
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <p className="whitespace-nowrap text-body-sm text-gray-400">
                {trustStripLabel && <span className="mr-1.5">{trustStripLabel}</span>}
                {trustStripItems.map((item, i) => (
                  <span key={item}>
                    <span className="font-semibold text-gray-600">{item}</span>
                    {i < trustStripItems.length - 1 ? '  ·  ' : ''}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>

        {dashboardStats.length > 0 && (
          <div className="card-elevated p-8 grid grid-cols-2 gap-6">
            {dashboardStats.map(({ label, value }) => (
              <div key={label}>
                <div className="font-black text-3xl" style={{ color: 'var(--accent)' }}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
