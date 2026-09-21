import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProcessTimelineSection from '@/components/sections/ProcessTimelineSection'
import CTASection from '@/components/sections/CTASection'
import SectionHeader from '@/components/ui/SectionHeader'

const PROOF_STATS = [
  { value: '40+',   label: 'Client Accounts' },
  { value: '$12K+', label: 'Monthly Ad Spend Managed' },
  { value: '10x',   label: 'Peak ROAS' },
  { value: '3+',    label: 'Years Experience' },
]

const PACKAGES = [
  {
    key: 'audit',
    num: '01',
    kicker: 'AUDIT',
    title: 'Performance Marketing Audit',
    price: '$150',
    priceNote: 'one-time',
    turnaround: 'Typical turnaround: 2 days',
    description: "Find out what's holding your paid acquisition back before putting more budget behind it.",
    bestFor: 'Businesses already running paid campaigns that want an independent performance review.',
    includes: [
      'Campaign structure review',
      'Targeting review',
      'Ad & creative review',
      'Budget allocation review',
      'Conversion tracking review',
      'Landing page/funnel review',
      'Key performance opportunities',
      'Actionable recommendations',
    ],
    platforms: null,
    ctaLabel: 'Get the Audit',
    variant: 'plain',
  },
  {
    key: 'manage',
    num: '02',
    kicker: 'MANAGE',
    title: 'Performance Marketing Management',
    price: '$350',
    priceNote: '/mo',
    turnaround: 'Typical turnaround: 3 days to launch',
    description: 'Ongoing campaign management and optimization across your paid acquisition channels.',
    bestFor: 'Businesses that want an experienced performance marketer managing and improving their campaigns continuously.',
    includes: [
      'Campaign management',
      'Campaign optimization',
      'Budget allocation',
      'Audience & targeting optimization',
      'Ad testing',
      'Performance monitoring',
      'Conversion tracking oversight',
      'Reporting & insights',
    ],
    platforms: ['Google Ads', 'Meta Ads', 'TikTok Ads'],
    ctaLabel: 'Explore Management',
    variant: 'featured',
  },
  {
    key: 'scale',
    num: '03',
    kicker: 'SCALE',
    title: 'Advanced Performance Growth',
    price: '$750',
    priceNote: '/mo',
    turnaround: 'Typical turnaround: 5 days to launch',
    description: 'Comprehensive performance marketing support for businesses ready to improve acquisition across campaigns, tracking and conversion.',
    bestFor: 'Businesses that need more than campaign management and want the acquisition system optimized as a whole.',
    includes: [
      'Paid campaign management',
      'Advanced optimization',
      'Tracking & attribution',
      'Conversion optimization',
      'Landing page recommendations',
      'Creative testing strategy',
      'Advanced reporting',
      'Growth strategy',
      'Cross-platform performance analysis',
    ],
    platforms: ['Google Ads', 'Meta Ads', 'TikTok Ads'],
    ctaLabel: 'Explore Growth',
    variant: 'advanced',
  },
]

const CHANNELS = [
  {
    icon: '🔍',
    title: 'Google Ads',
    description: 'Capture existing demand and turn high-intent searches into measurable leads, sales and revenue.',
    items: ['Search', 'Performance Max', 'Shopping', 'YouTube', 'Remarketing', 'Campaign optimization'],
    ctaLabel: 'Explore Google Ads',
  },
  {
    icon: '📱',
    title: 'Meta Ads',
    description: 'Build demand, generate conversions and scale winning creative across Facebook and Instagram.',
    items: ['Prospecting', 'Retargeting', 'Sales campaigns', 'Lead generation', 'Creative testing', 'Audience testing'],
    ctaLabel: 'Explore Meta Ads',
  },
  {
    icon: '🎵',
    title: 'TikTok Ads',
    description: 'Combine creative-led advertising with performance measurement to turn attention into measurable acquisition.',
    items: ['Prospecting', 'Conversion campaigns', 'Creative testing', 'Retargeting', 'Performance optimization'],
    ctaLabel: 'Explore TikTok Ads',
  },
]

const SUPPORTING_SERVICES = [
  { icon: '📊', title: 'Tracking & Attribution', description: 'GA4, GTM, conversion tracking, attribution and revenue measurement.' },
  { icon: '🔁', title: 'Conversion Optimization', description: 'Landing page analysis, funnel improvements and conversion-rate optimization.' },
  { icon: '🎨', title: 'Creative & Ad Copy', description: 'Testing messaging, creative angles, hooks and offers to identify what drives action.' },
  { icon: '📈', title: 'Reporting & Analytics', description: 'Turn campaign data into clear decisions about what to scale, fix or stop.' },
]

const PRINCIPLE_REASONS = [
  "Tracking isn't reliable.",
  "The offer isn't converting.",
  'The landing page leaks intent.',
  'Lead quality is poor.',
  'Creative fatigue is increasing.',
  'Campaign structure makes testing difficult.',
  "The unit economics don't support scaling.",
]

const HOW_STEPS = [
  { number: 1, title: 'Discover', description: 'Understand the business, current campaigns, tracking and goals.' },
  { number: 2, title: 'Diagnose', description: "Identify what's working, what's leaking budget and what needs attention." },
  { number: 3, title: 'Execute', description: 'Manage, optimize and scale based on the appropriate engagement.' },
]

const RESULT_CARDS = [
  { slug: 'tech-trade-group-google-ads', headline: '4.76x ROAS', supporting: '79% lower cost per conversion' },
  { slug: 'zebra-effect-meta-ads', headline: '139% Purchase Growth', supporting: '$9.50 lowest cost per purchase' },
  { slug: 'citedevidence-ai-meta-ads', headline: '100 Conversions', supporting: '$1.94 blended CPA' },
]

async function getResultCaseStudies() {
  const { data } = await supabase
    .from('case_studies')
    .select('slug, client_name, industry, channel')
    .eq('is_published', true)
    .in('slug', RESULT_CARDS.map(c => c.slug))
  return data || []
}

function PackageCard({ pkg }) {
  const isFeatured = pkg.variant === 'featured'
  const isAdvanced = pkg.variant === 'advanced'

  let cardCls = 'relative flex flex-col p-8 rounded-2xl bg-white transition-all duration-200 '
  if (isFeatured) cardCls += 'border-2 shadow-accent lg:-translate-y-2'
  else if (isAdvanced) cardCls += 'border-2'
  else cardCls += 'border'

  const borderStyle = isFeatured
    ? { borderColor: 'var(--accent)' }
    : isAdvanced
      ? { borderColor: 'var(--deep-black)' }
      : { borderColor: 'var(--color-border)' }

  return (
    <div className={cardCls} style={borderStyle}>
      {isFeatured && (
        <span
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-extrabold text-white px-3 py-1 rounded-full whitespace-nowrap"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Most Popular
        </span>
      )}
      {isAdvanced && (
        <span
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-extrabold text-white px-3 py-1 rounded-full whitespace-nowrap"
          style={{ backgroundColor: 'var(--deep-black)' }}
        >
          Comprehensive
        </span>
      )}

      <span className="text-xs font-extrabold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
        {pkg.num} &mdash; {pkg.kicker}
      </span>

      <h3 className="font-extrabold text-deep text-xl leading-snug mb-3">{pkg.title}</h3>
      <p className="text-body-sm text-gray-500 leading-relaxed mb-5">{pkg.description}</p>

      <div className="mb-5 pb-5 border-b border-gray-100">
        <div className="flex items-baseline gap-1.5">
          <span className="text-price-val" style={isFeatured ? { color: 'var(--accent)' } : {}}>{pkg.price}</span>
          <span className="text-body-sm text-gray-400 font-medium">{pkg.priceNote}</span>
        </div>
        <p className="text-body-sm text-gray-400 font-medium mt-1.5">{pkg.turnaround}</p>
      </div>

      <p className="text-body-sm text-gray-500 leading-relaxed mb-5">
        <span className="font-bold text-deep">Best for: </span>{pkg.bestFor}
      </p>

      <ul className="space-y-2 mb-6 flex-1">
        {pkg.includes.map(item => (
          <li key={item} className="flex items-start gap-2 text-body-sm text-gray-600">
            <span className="shrink-0 mt-0.5 font-bold" style={{ color: 'var(--accent)' }}>✓</span>
            {item}
          </li>
        ))}
      </ul>

      {pkg.platforms && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {pkg.platforms.map(p => (
            <span key={p} className="badge-gray">{p}</span>
          ))}
        </div>
      )}

      <Link
        href={`/contact?subject=${encodeURIComponent(pkg.title)}`}
        className={`block text-center py-3 rounded-xl font-bold text-sm transition-all mb-3 ${
          isFeatured ? 'text-white hover:opacity-90' : 'border-2 hover:border-accent hover:text-accent'
        }`}
        style={
          isFeatured
            ? { backgroundColor: 'var(--accent)' }
            : isAdvanced
              ? { borderColor: 'var(--deep-black)', color: 'var(--deep-black)' }
              : { borderColor: 'var(--color-border)', color: 'var(--color-text)' }
        }
      >
        {pkg.ctaLabel}
      </Link>
      <Link href="/contact" className="block text-center text-body-sm font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
        Book a Strategy Call
      </Link>
    </div>
  )
}

function ChannelCard({ channel }) {
  return (
    <div className="card p-6 flex flex-col">
      <div className="text-2xl mb-4" aria-hidden="true">{channel.icon}</div>
      <h3 className="font-extrabold text-deep text-lg mb-2">{channel.title}</h3>
      <p className="text-body-sm text-gray-500 mb-4">{channel.description}</p>
      <ul className="space-y-1.5 mb-6 flex-1 pt-4 border-t border-gray-100">
        {channel.items.map(item => (
          <li key={item} className="flex items-center gap-2 text-body-sm text-gray-600">
            <span className="dot-accent shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <Link href="/services/performance-marketing" className="text-body-sm font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
        {channel.ctaLabel} &rarr;
      </Link>
    </div>
  )
}

function ResultCard({ meta, card }) {
  if (!meta) return null
  return (
    <Link
      href={`/case-studies/${card.slug}`}
      className="group block card p-6 hover:border-accent/30 hover:-translate-y-1 transition-all duration-200"
    >
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {meta.channel && <span className="badge-accent">{meta.channel}</span>}
        {meta.industry && <span className="badge-gray">{meta.industry}</span>}
      </div>
      <div className="font-black text-2xl mb-1 leading-tight" style={{ color: 'var(--accent)' }}>{card.headline}</div>
      <p className="text-body-sm text-gray-500 mb-5">{card.supporting}</p>
      <div className="font-bold text-deep text-sm mb-4">{meta.client_name}</div>
      <span className="inline-flex items-center gap-1 group-hover:gap-2 transition-all font-semibold text-sm" style={{ color: 'var(--accent)' }}>
        View Case Study &rarr;
      </span>
    </Link>
  )
}

export default async function GigsClient() {
  const caseStudies = await getResultCaseStudies()
  const csBySlug = Object.fromEntries(caseStudies.map(cs => [cs.slug, cs]))

  return (
    <main style={{ fontFamily: "'Raleway', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="w-full pt-32 pb-16 lg:pt-40 lg:pb-20" style={{ backgroundColor: '#fff' }}>
        <div className="section-wrap max-w-3xl">
          <span className="eyebrow mb-4 inline-block">PERFORMANCE MARKETING</span>
          <h1 className="heading-display mb-5">Performance Marketing Services</h1>
          <p className="text-body text-gray-500 mb-8 max-w-2xl">
            Paid acquisition, campaign management and growth optimization built around measurable business
            outcomes — not vanity metrics.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link href="/contact" className="btn btn-lg bg-accent text-white hover:bg-accent-dark hover:shadow-accent hover:-translate-y-px active:translate-y-0">
              Book a Strategy Call
            </Link>
            <Link href="/case-studies" className="btn btn-lg bg-white text-deep border border-gray-200 hover:border-accent/40 hover:-translate-y-px active:translate-y-0">
              View Case Studies
            </Link>
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
      </section>

      {/* ── Introduction ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="section-wrap max-w-3xl">
          <span className="eyebrow mb-3 inline-block">THE RIGHT SUPPORT FOR EVERY STAGE</span>
          <h2 className="heading-display mb-4">From Fixing Performance To Scaling What Works.</h2>
          <p className="text-body text-gray-500 mb-8">
            Not every account needs the same level of support. Sometimes you need an experienced second set
            of eyes. Sometimes you need someone to take over campaign management. And sometimes you need a
            complete acquisition system built to scale.
          </p>
          <div className="flex flex-wrap gap-3">
            {['01 — Audit', '02 — Manage', '03 — Scale'].map(label => (
              <span key={label} className="badge-accent">{label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Packages ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
        <div className="section-wrap">
          <SectionHeader
            title="Choose How You Want To Work Together"
            subtitle="Start with the level of support that matches where your paid acquisition is today."
            align="center"
          />
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 lg:items-start">
            {PACKAGES.map(pkg => <PackageCard key={pkg.key} pkg={pkg} />)}
          </div>
        </div>
      </section>

      {/* ── Service Areas ────────────────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="section-wrap">
          <SectionHeader
            eyebrow="WHAT I CAN MANAGE"
            title="Performance Marketing Across The Channels That Matter."
            subtitle="The right channel depends on your audience, offer, buying journey and economics. The objective is not to be everywhere. It's to make the right channels perform."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHANNELS.map(channel => <ChannelCard key={channel.title} channel={channel} />)}
          </div>

          <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 mt-6" style={{ backgroundColor: '#fff' }}>
            <span className="text-lg shrink-0" aria-hidden="true">➕</span>
            <div>
              <h4 className="font-bold text-deep text-sm mb-1">AI-Native Ad Platforms</h4>
              <p className="text-body-sm text-gray-500">
                ChatGPT and other AI-native ad platforms can be added when they fit the strategy and economics.{' '}
                <Link href="/pricing/chatgpt-ads" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
                  See AI ad copy &amp; ChatGPT ad strategy →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Supporting Performance Services ──────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
        <div className="section-wrap">
          <SectionHeader
            eyebrow="THE SYSTEM BEHIND THE ADS"
            title="Performance Doesn't Stop At The Campaign."
            subtitle="A campaign can only perform as well as the system around it. That's why performance marketing also includes the measurement, conversion and creative infrastructure behind every click."
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SUPPORTING_SERVICES.map(s => (
              <div key={s.title} className="rounded-xl p-5" style={{ backgroundColor: '#F9FAFB' }}>
                <div className="text-xl mb-3" aria-hidden="true">{s.icon}</div>
                <h4 className="font-bold text-deep text-sm mb-1.5">{s.title}</h4>
                <p className="text-body-sm text-gray-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Principle ─────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#111827' }}>
        <div className="section-wrap max-w-3xl">
          <span className="eyebrow mb-3 inline-block" style={{ color: 'var(--accent)' }}>A DIFFERENT APPROACH</span>
          <h2 className="heading-display text-white mb-4">More Ad Spend Isn&rsquo;t Always The Answer.</h2>
          <p className="text-body text-gray-400 mb-8">More budget doesn&rsquo;t fix broken economics.</p>

          <ul className="space-y-3 mb-10">
            {PRINCIPLE_REASONS.map(reason => (
              <li key={reason} className="flex items-start gap-3 text-body text-gray-300">
                <span className="shrink-0 mt-0.5 font-black" style={{ color: 'var(--accent)' }} aria-hidden="true">✕</span>
                {reason}
              </li>
            ))}
          </ul>

          <p className="font-extrabold text-lg text-white pt-8 border-t border-gray-800">
            The goal isn&rsquo;t to spend more. It&rsquo;s to make the next dollar work harder than the last.
          </p>
        </div>
      </section>

      {/* ── Proof / Case Studies ─────────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
        <div className="section-wrap">
          <SectionHeader
            eyebrow="PROOF, NOT PROMISES"
            title="Real Campaigns. Real Numbers."
            subtitle="Performance marketing should be judged by outcomes, not activity reports."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {RESULT_CARDS.map(card => (
              <ResultCard key={card.slug} card={card} meta={csBySlug[card.slug]} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/case-studies" className="btn-secondary btn-lg">View All Case Studies</Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <ProcessTimelineSection
        content={{
          eyebrow: 'HOW IT WORKS',
          title: 'How We Start',
          subtitle: 'Start with clarity. Then decide what to scale.',
          steps: HOW_STEPS,
        }}
      />

      {/* ── Not Sure Which Package? ──────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
        <div className="section-wrap max-w-2xl text-center">
          <h2 className="heading-display mb-4">Not Sure Where To Start?</h2>
          <p className="text-body text-gray-500 mb-8">
            If you&rsquo;re not sure whether you need an audit, ongoing management or a more comprehensive
            growth engagement, let&rsquo;s look at the current situation first.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary btn-lg">Book a Strategy Call</Link>
            <Link href="/case-studies" className="btn-secondary btn-lg">View Case Studies</Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <CTASection
        content={{
          eyebrow: 'READY TO IMPROVE PERFORMANCE?',
          title: "Let's Make Your Ad Spend Work Harder.",
          subtitle: "Tell me where you're stuck, what you're trying to improve, and what you're currently running. We'll identify the right place to start.",
          ctaLabel: 'Book a Strategy Call',
          ctaHref: '/contact',
          secondaryLabel: 'View Case Studies',
          secondaryHref: '/case-studies',
        }}
      />
    </main>
  )
}
