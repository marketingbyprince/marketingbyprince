import { Fragment } from 'react'
import Link from 'next/link'
import FeatureCardsSection from '@/components/sections/FeatureCardsSection'
import ProcessTimelineSection from '@/components/sections/ProcessTimelineSection'
import FAQAccordionSection from '@/components/sections/FAQAccordionSection'
import CTASection from '@/components/sections/CTASection'
import SectionHeader from '@/components/ui/SectionHeader'

const PROOF_STATS = [
  { value: '40+',  label: 'Client Accounts' },
  { value: '$12K+', label: 'Monthly Ad Spend Managed' },
  { value: '10x',  label: 'Peak ROAS' },
  { value: '3+',   label: 'Years Experience' },
]

const REAL_JOB_FLOW = ['Strategy', 'Media', 'Tracking', 'Creative', 'Landing Page', 'Conversion', 'Revenue']

const TRACKING_FLOW = ['Ad Platform', 'Click', 'Landing Page', 'Conversion', 'GA4 / GTM', 'CRM / Backend', 'Revenue']

const TRACKING_STACK = [
  'GA4', 'Google Tag Manager', 'Conversion Tracking', 'Server-Side Tracking',
  'Meta CAPI (where appropriate)', 'Attribution', 'CRM Integration', 'Lead Quality Tracking', 'Revenue Tracking',
]

const OTHER_CHANNELS = ['X', 'Reddit', 'Pinterest', 'Telegram', 'Taboola', 'Traffic Junky', 'AI-Native Ad Platforms']

const OPTIMIZED_CARDS = [
  { icon: '🧱', title: 'Campaign Structure', description: 'Build account and campaign structures that make testing, reporting and scaling easier.' },
  { icon: '🎯', title: 'Audience & Targeting', description: 'Identify the audiences, intent signals and segments most likely to produce meaningful outcomes.' },
  { icon: '🎨', title: 'Creative Testing', description: 'Test messaging, formats, hooks and creative angles to discover what drives action.' },
  { icon: '🖥️', title: 'Landing Pages', description: 'Improve the path between the click and the conversion.' },
  { icon: '🔁', title: 'Conversion Optimization', description: 'Remove friction and improve the percentage of visitors who take the desired action.' },
  { icon: '💰', title: 'Budget Allocation', description: 'Move budget toward what is working and reduce spend where the economics no longer make sense.' },
]

const PROCESS_STEPS = [
  { number: 1, title: 'Audit', description: 'Review the current campaigns, account structure, tracking, attribution, creative, landing pages and conversion journey. Goal: know what needs fixing.' },
  { number: 2, title: 'Build', description: 'Build or restructure campaigns, audiences, tracking, creative testing systems and conversion infrastructure. Goal: create a system worth scaling.' },
  { number: 3, title: 'Scale', description: 'Increase investment in winning campaigns, audiences and creative while monitoring acquisition economics. Goal: grow without blindly increasing spend.' },
  { number: 4, title: 'Optimize', description: 'Continuous testing, budget allocation, creative iteration, CRO and measurement improvements. Goal: keep the growth engine improving.' },
]

const WHY_CARDS = [
  { icon: '🎯', title: 'Full-Funnel Ownership', description: 'Ads, tracking, landing pages and conversion performance considered as one system.' },
  { icon: '📊', title: 'Tracking You Can Trust', description: 'GA4, GTM, attribution and server-side measurement built around real business outcomes.' },
  { icon: '⚡', title: 'Senior-Level Execution', description: 'No layers of account managers between you and the person actually running the campaigns.' },
  { icon: '🔁', title: 'Continuous Optimization', description: 'Campaigns are continuously tested and improved rather than simply monitored.' },
  { icon: '🧩', title: 'Platform-Agnostic Thinking', description: 'The strategy follows the customer and the economics — not a predetermined platform.' },
  { icon: '🔍', title: 'Audit-First Approach', description: 'Start by understanding what is happening before deciding what should happen next.' },
]

const RESULT_CARDS = [
  { slug: 'tech-trade-group-google-ads', headline: 'From 1.29 ROAS to 4.76 ROAS', supporting: '79% lower cost per conversion' },
  { slug: 'zebra-effect-meta-ads', headline: '139% Purchase Growth', supporting: '$9.50 lowest cost per purchase' },
  { slug: 'citedevidence-ai-meta-ads', headline: '100 Conversions', supporting: '$1.94 blended CPA' },
  { slug: 'athens-residents-meta-lead-gen', headline: '€0.37–€1.29 Cost per Lead', supporting: 'Down from €35–€64 early CPL' },
]

const AUDIENCE_CARDS = [
  { icon: '🛍️', title: 'D2C & eCommerce', description: 'For brands looking to acquire customers profitably and scale paid sales.' },
  { icon: '💻', title: 'SaaS & Technology', description: 'For businesses that need measurable acquisition and reliable CAC/CPA visibility.' },
  { icon: '📩', title: 'Lead Generation', description: 'For businesses where lead volume is only useful when lead quality and downstream value can be measured.' },
  { icon: '🤝', title: 'Agencies & White-Label Partners', description: 'For agencies that need experienced paid-media execution, tracking or campaign support behind the scenes.' },
]

const DONT_SCALE_REASONS = [
  "Tracking isn't reliable.",
  "The offer isn't converting.",
  'The landing page leaks intent.',
  'Lead quality is poor.',
  'Creative fatigue is increasing.',
  'Campaign structure makes testing difficult.',
  "The unit economics don't support scaling.",
]

const FAQ_ITEMS = [
  {
    question: 'What is performance marketing?',
    answer: 'Performance marketing is a measurable form of digital advertising where campaigns are optimized around specific business outcomes such as leads, purchases, revenue, CPA, CAC or ROAS rather than simply impressions or traffic.',
  },
  {
    question: 'Which advertising platforms do you manage?',
    answer: 'The core paid acquisition platforms are Google, Meta and TikTok. Additional channels can be considered when they make sense for the business, audience and economics.',
  },
  {
    question: 'Do you only manage ad campaigns?',
    answer: 'No. Performance depends on more than the campaign itself. Tracking, attribution, creative, landing pages and conversion optimization all influence the final result.',
  },
  {
    question: 'How do you measure performance?',
    answer: 'Measurement depends on the business model, but can include conversions, CPA, CAC, ROAS, revenue, lead quality and downstream customer value.',
  },
  {
    question: 'Do you work with existing ad accounts?',
    answer: 'Yes. Existing accounts can be audited, restructured and optimized rather than automatically rebuilt from scratch.',
  },
  {
    question: 'Do you work with agencies?',
    answer: 'Yes. Performance marketing, campaign management, tracking and related execution can be provided for agency and white-label engagements where appropriate.',
  },
  {
    question: 'How does an engagement start?',
    answer: 'The first step is understanding the current account, tracking setup, business goals and acquisition economics. From there, the appropriate scope can be determined.',
  },
  {
    question: "What makes your approach different?",
    answer: 'The focus is not simply on generating more clicks. Campaign performance is evaluated together with tracking, conversion behavior, funnel performance and business economics.',
  },
]

function FlowDiagram({ steps }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3" role="list" aria-label="Process flow">
      {steps.map((step, i) => (
        <Fragment key={step}>
          <div role="listitem" className="card px-4 py-3 text-center" style={{ minWidth: '128px' }}>
            <span className="text-body-sm font-bold text-deep">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <span className="font-black text-lg leading-none shrink-0" style={{ color: 'var(--accent)' }} aria-hidden="true">
              →
            </span>
          )}
        </Fragment>
      ))}
    </div>
  )
}

function MetricTag({ label, direction }) {
  const up = direction === 'up'
  return (
    <div className="rounded-xl border border-gray-200 px-3 py-2.5 text-center">
      <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{label}</div>
      <div className="font-extrabold text-sm" style={{ color: 'var(--accent)' }}>
        {up ? '↑ Scaling' : '↓ Trimming'}
      </div>
    </div>
  )
}

function AcquisitionDashboardVisual() {
  const stages = [
    { icon: '💰', label: 'Ad Spend' },
    { icon: '👥', label: 'Traffic' },
    { icon: '🎯', label: 'Leads / Sales' },
    { icon: '📈', label: 'Revenue' },
  ]
  return (
    <div className="card-elevated p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Acquisition Flow</span>
        <span className="badge-accent">Live Funnel</span>
      </div>

      <div className="grid grid-cols-4 gap-1 mb-6">
        {stages.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center text-center min-w-0">
            <div className="flex items-center gap-1 mb-1">
              {i > 0 && <span className="text-xs font-black shrink-0" style={{ color: 'var(--accent-border)' }} aria-hidden="true">→</span>}
              <span className="text-xl" aria-hidden="true">{s.icon}</span>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 leading-tight">{s.label}</span>
          </div>
        ))}
      </div>

      <svg viewBox="0 0 300 70" className="w-full h-16 mb-6" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          points="0,62 60,50 120,52 180,28 240,18 300,4"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="grid grid-cols-3 gap-3">
        <MetricTag label="ROAS" direction="up" />
        <MetricTag label="CPA" direction="down" />
        <MetricTag label="CAC" direction="down" />
      </div>
    </div>
  )
}

function PlatformCard({ icon, title, description, items }) {
  return (
    <div className="card p-6 flex flex-col">
      <div className="text-2xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="font-extrabold text-deep text-lg mb-2">{title}</h3>
      <p className="text-body-sm text-gray-500 mb-4">{description}</p>
      <ul className="space-y-1.5 mt-auto pt-4 border-t border-gray-100">
        {items.map(item => (
          <li key={item} className="flex items-center gap-2 text-body-sm text-gray-600">
            <span className="dot-accent shrink-0" />
            {item}
          </li>
        ))}
      </ul>
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
      <div className="font-black text-2xl mb-1 leading-tight" style={{ color: 'var(--accent)' }}>
        {card.headline}
      </div>
      <p className="text-body-sm text-gray-500 mb-5">{card.supporting}</p>
      <div className="font-bold text-deep text-sm mb-4">{meta.client_name}</div>
      <span
        className="inline-flex items-center gap-1 group-hover:gap-2 transition-all font-semibold text-sm"
        style={{ color: 'var(--accent)' }}
      >
        View Case Study &rarr;
      </span>
    </Link>
  )
}

export default function PerformanceMarketingContent({ caseStudies = [] }) {
  const csBySlug = Object.fromEntries(caseStudies.map(cs => [cs.slug, cs]))

  return (
    <main style={{ fontFamily: "'Raleway', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="w-full pt-32 pb-16 lg:pt-40 lg:pb-24" style={{ backgroundColor: '#fff' }}>
        <div className="section-wrap grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="eyebrow mb-4 inline-block">PERFORMANCE MARKETING</span>
            <h1 className="heading-display mb-5">Turn Ad Spend Into Predictable Growth.</h1>
            <p className="text-body text-gray-500 mb-8 max-w-xl">
              I build and manage paid acquisition systems across Google, Meta and TikTok — connecting
              media buying with tracking, creative, landing pages and conversion optimization so you know
              what is working, what is wasting budget, and where to scale next.
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

          <AcquisitionDashboardVisual />
        </div>
      </section>

      {/* ── The Real Job ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="section-wrap">
          <SectionHeader
            eyebrow="THE REAL JOB"
            title="Running Ads Is Easy. Building a Growth Engine Is Hard."
          />
          <p className="text-body text-gray-500 max-w-3xl mb-4">
            Anyone can launch a campaign. The difficult part is knowing whether the numbers are real,
            where the funnel is leaking, which audiences are worth scaling, and when additional budget
            will actually create profitable growth.
          </p>
          <p className="text-body text-gray-500 max-w-3xl mb-10">
            That&rsquo;s where performance marketing becomes more than media buying.
          </p>

          <FlowDiagram steps={REAL_JOB_FLOW} />

          <p className="text-body-sm text-gray-500 max-w-3xl mt-8">
            Every part of the acquisition journey affects the next. I connect those pieces — including{' '}
            <Link href="/services?pillar=Creative%20Studio" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              creative production
            </Link>{' '}
            and{' '}
            <Link href="/services?pillar=Website%20%26%20App%20Development" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              landing page development
            </Link>{' '}
            — instead of optimizing each one in isolation.
          </p>
        </div>
      </section>

      {/* ── What I Manage ────────────────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
        <div className="section-wrap">
          <SectionHeader
            eyebrow="PAID ACQUISITION"
            title="The Right Channel. The Right Objective. The Right Economics."
            subtitle="Different businesses require different acquisition strategies. The platform is simply the delivery mechanism — the goal is profitable growth."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <PlatformCard
              icon="🔍"
              title="Google Ads"
              description="Capture existing demand and put your brand in front of people actively searching for your product or service."
              items={['Search', 'Performance Max', 'Shopping', 'Display', 'YouTube', 'Remarketing']}
            />
            <PlatformCard
              icon="📱"
              title="Meta Ads"
              description="Build demand, generate conversions and scale winning creative through Facebook and Instagram."
              items={['Prospecting', 'Retargeting', 'Sales campaigns', 'Lead generation', 'Creative testing', 'Audience testing']}
            />
            <PlatformCard
              icon="🎵"
              title="TikTok Ads"
              description="Turn attention into measurable acquisition through creative-led paid campaigns."
              items={['Conversion campaigns', 'Creative testing', 'Prospecting', 'Retargeting', 'Performance optimization']}
            />
          </div>

          <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 mt-6" style={{ backgroundColor: 'var(--color-bg)' }}>
            <span className="text-lg shrink-0" aria-hidden="true">➕</span>
            <div>
              <h4 className="font-bold text-deep text-sm mb-1">Other Paid Channels</h4>
              <p className="text-body-sm text-gray-500 mb-2.5">
                When the economics make sense, campaigns can also extend beyond the core platforms.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OTHER_CHANNELS.map(ch => (
                  <span key={ch} className="badge-gray">{ch}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What Actually Gets Optimized ─────────────────────────── */}
      <FeatureCardsSection
        content={{
          eyebrow: 'BEYOND THE CAMPAIGN',
          title: "A Campaign Doesn't Exist in Isolation.",
          subtitle: "A great ad can't compensate for broken tracking. Great targeting can't fix a weak offer. And more traffic won't solve a landing page that doesn't convert.",
          cards: OPTIMIZED_CARDS,
        }}
      />

      {/* ── Tracking & Attribution ───────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
        <div className="section-wrap">
          <SectionHeader
            eyebrow="MEASUREMENT"
            title="If You Can't Trust the Data, You Can't Trust the Decisions."
          />
          <p className="text-body text-gray-500 max-w-3xl mb-8">
            Performance marketing depends on reliable measurement. Before scaling spend, the tracking
            foundation needs to tell you what happened after the click — not just what the ad platform
            wants you to believe happened.
          </p>

          <div className="rounded-xl border-l-4 p-5 mb-10" style={{ borderLeftColor: 'var(--accent)', backgroundColor: 'var(--accent-muted)' }}>
            <p className="font-extrabold text-deep">
              Tracking is not an add-on. It&rsquo;s part of the acquisition strategy.
            </p>
          </div>

          <FlowDiagram steps={TRACKING_FLOW} />

          <p className="text-body-sm text-gray-500 max-w-3xl mt-8 mb-4">
            This is the same measurement foundation used across{' '}
            <Link href="/services?pillar=Analytics%20%26%20Automation" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              Analytics &amp; Automation
            </Link>{' '}
            engagements — GA4, server-side tracking and CRM architecture built around real outcomes:
          </p>

          <div className="flex flex-wrap gap-2">
            {TRACKING_STACK.map(tool => (
              <span key={tool} className="badge-accent">{tool}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How I Work ────────────────────────────────────────────── */}
      <ProcessTimelineSection
        content={{
          eyebrow: 'THE PROCESS',
          title: 'Audit. Build. Scale. Optimize.',
          subtitle: 'Every engagement follows a continuous improvement loop.',
          steps: PROCESS_STEPS,
        }}
      />

      {/* ── Why Marketing By Prince ──────────────────────────────── */}
      <FeatureCardsSection
        content={{
          eyebrow: 'WHY WORK WITH ME',
          title: 'One Senior Partner. No Account Handoffs.',
          subtitle: 'You work directly with the person responsible for strategy, execution, optimization and reporting.',
          cards: WHY_CARDS,
        }}
      />

      {/* ── Results ───────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
        <div className="section-wrap">
          <SectionHeader
            eyebrow="PROOF, NOT PROMISES"
            title="Real Campaigns. Real Numbers."
            subtitle="Performance marketing should be judged by outcomes, not activity reports."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {RESULT_CARDS.map(card => (
              <ResultCard key={card.slug} card={card} meta={csBySlug[card.slug]} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/case-studies" className="btn-secondary btn-lg">View All Case Studies</Link>
          </div>
        </div>
      </section>

      {/* ── Who This Is For ───────────────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="section-wrap">
          <SectionHeader
            eyebrow="IS THIS A FIT?"
            title="Built For Businesses That Care About What Happens After The Click."
            align="center"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {AUDIENCE_CARDS.map(card => (
              <div key={card.title} className="card p-6">
                <div className="text-2xl mb-4" aria-hidden="true">{card.icon}</div>
                <h3 className="font-extrabold text-deep mb-2">{card.title}</h3>
                <p className="text-body-sm text-gray-500">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── When You Should Not Scale ─────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#111827' }}>
        <div className="section-wrap max-w-3xl">
          <span className="eyebrow mb-3 inline-block" style={{ color: 'var(--accent)' }}>A DIFFERENT APPROACH</span>
          <h2 className="heading-display text-white mb-4">Sometimes The Right Answer Is: Don&rsquo;t Spend More Yet.</h2>
          <p className="text-body text-gray-400 mb-8">More budget doesn&rsquo;t fix broken economics.</p>

          <ul className="space-y-3 mb-10">
            {DONT_SCALE_REASONS.map(reason => (
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

      {/* ── Engagement ────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#fff' }}>
        <div className="section-wrap max-w-2xl text-center">
          <span className="eyebrow mb-3 inline-block">HOW WE START</span>
          <h2 className="heading-display mb-4">Start With Clarity. Then Decide What To Scale.</h2>
          <p className="text-body text-gray-500 mb-8">
            Every engagement begins with understanding the current situation — your campaigns, tracking,
            funnel and economics. From there, we determine what should be fixed, built or scaled.
          </p>
          <Link href="/contact" className="btn-primary btn-lg mb-5 inline-flex">Book a Strategy Call</Link>
          <p className="text-body-sm text-gray-400 mb-3 max-w-md mx-auto">
            We&rsquo;ll identify what&rsquo;s working, what&rsquo;s leaking budget and what deserves attention first.
          </p>
          <Link href="/pricing" className="text-body-sm font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
            See pricing &amp; packages &rarr;
          </Link>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <FAQAccordionSection
        content={{
          eyebrow: 'FAQs',
          title: 'Performance Marketing FAQs',
          items: FAQ_ITEMS,
        }}
      />

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <CTASection
        content={{
          title: 'Make Your Ad Spend Work Harder.',
          subtitle: "Let's identify what's working, what's leaking budget, and what needs to change before you put more money behind it.",
          ctaLabel: 'Book a Strategy Call',
          ctaHref: '/contact',
          secondaryLabel: 'View Case Studies',
          secondaryHref: '/case-studies',
        }}
      />
    </main>
  )
}
