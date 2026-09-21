import Link from 'next/link'

const PROOF_STATS = [
  { value: '40+',  label: 'Client Accounts' },
  { value: '$12K+', label: 'Monthly Ad Spend Managed' },
  { value: '10x',  label: 'Peak ROAS' },
  { value: '3.5+', label: 'Years Agency-Side PPC' },
]

const PROCESS_STEPS = [
  { number: 1, title: 'Audit', description: 'Review the current account, tracking, creative and conversion path to see what is actually happening.' },
  { number: 2, title: 'Strategy', description: 'Build a plan around your budget, audience and business goals, not a generic template.' },
  { number: 3, title: 'Launch', description: 'Set up campaigns, tracking and creative, then launch with a clear testing plan.' },
  { number: 4, title: 'Optimize & Report', description: 'Continuously test, reallocate budget toward what works, and report on the numbers that matter.' },
]

function Breadcrumb({ serviceName }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold mb-6">
      <Link href="/" className="hover:text-accent transition-colors" style={{ color: 'var(--color-subtle)' }}>Home</Link>
      <span style={{ color: 'var(--color-subtle)' }}>&rsaquo;</span>
      <Link href="/services" className="hover:text-accent transition-colors" style={{ color: 'var(--color-subtle)' }}>Services</Link>
      <span style={{ color: 'var(--color-subtle)' }}>&rsaquo;</span>
      <span style={{ color: 'var(--color-text-2)' }}>{serviceName}</span>
    </nav>
  )
}

export default function ServiceLandingPage({
  serviceName,
  eyebrow,
  h1,
  intro,
  whoFor,
  included,
  faqs,
  related,
}) {
  const ctaHref = `/contact?subject=${encodeURIComponent(serviceName)}`

  return (
    <main className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-wrap max-w-4xl">

        <Breadcrumb serviceName={serviceName} />

        {/* Hero */}
        <div className="mb-14">
          <span className="eyebrow mb-3 inline-block">{eyebrow}</span>
          <h1 className="heading-display text-deep mb-5">{h1}</h1>
          <p className="text-body text-gray-500 max-w-2xl mb-8">{intro}</p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link href={ctaHref} className="btn-primary btn-lg">Book a Strategy Call</Link>
            <Link href="/case-studies" className="btn-secondary btn-lg">View Case Studies</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
            {PROOF_STATS.map(stat => (
              <div key={stat.label}>
                <div className="font-black text-2xl" style={{ color: 'var(--accent)' }}>{stat.value}</div>
                <div className="text-body-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Who this is for */}
        <section className="mb-14">
          <h2 className="heading-section text-deep mb-6">Who This Is For</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {whoFor.map(item => (
              <div key={item} className="card p-5 flex items-start gap-3">
                <span className="shrink-0 mt-0.5 font-bold" style={{ color: 'var(--accent)' }} aria-hidden="true">&rsaquo;</span>
                <p className="text-body-sm text-gray-600">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What's included */}
        <section className="mb-14">
          <h2 className="heading-section text-deep mb-6">What&rsquo;s Included</h2>
          <div className="card p-6">
            <ul className="space-y-3">
              {included.map(item => (
                <li key={item} className="flex items-start gap-3 text-body text-gray-600">
                  <span className="shrink-0 mt-1 font-bold" style={{ color: 'var(--accent)' }} aria-hidden="true">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How I work */}
        <section className="mb-14">
          <h2 className="heading-section text-deep mb-6">How I Work</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROCESS_STEPS.map(step => (
              <div key={step.number} className="card p-5">
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-extrabold mb-4"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {step.number}
                </span>
                <h3 className="font-extrabold text-deep mb-1.5">{step.title}</h3>
                <p className="text-body-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="heading-section text-deep mb-6">FAQs</h2>
          <div className="space-y-3">
            {faqs.map(item => (
              <div key={item.q} className="card p-5">
                <h3 className="font-extrabold text-deep text-sm mb-2">{item.q}</h3>
                <p className="text-body-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related links */}
        <section className="mb-14">
          <h2 className="heading-section text-deep mb-6">Related</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/services/performance-marketing" className="badge-gray hover:text-accent transition-colors">Performance Marketing</Link>
            {related.map(r => (
              <Link key={r.href} href={r.href} className="badge-gray hover:text-accent transition-colors">{r.label}</Link>
            ))}
            <Link href="/case-studies" className="badge-gray hover:text-accent transition-colors">Case Studies</Link>
            <Link href="/contact" className="badge-gray hover:text-accent transition-colors">Contact</Link>
          </div>
        </section>

        {/* Final CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
          <h3 className="heading-section mb-2">Ready to fix what&rsquo;s leaking budget?</h3>
          <p className="text-body text-gray-500 mb-6">Let&rsquo;s look at your account and figure out what to fix, build or scale.</p>
          <Link href={ctaHref} className="btn-primary btn-lg">Book a Strategy Call</Link>
        </div>

      </div>
    </main>
  )
}
