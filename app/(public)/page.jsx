'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import StatCounter from '@/components/StatCounter'
import SectionHeader from '@/components/ui/SectionHeader'

export const metadata = {
  title: 'Performance Marketing Consultant India | Prince Pandey',
  description: 'Results-driven PPC, Meta Ads, SEO & CRO services. 40+ clients, 3-5x ROAS. Based in Panchkula, serving pan-India.',
  alternates: { canonical: 'https://marketingbyprince.com' },
}

const stats = [
  { value: 40,  suffix: '+',      label: 'Client Accounts' },
  { value: 10,  suffix: 'x',      label: 'Peak ROAS' },
  { value: 12,  prefix: '$', suffix: 'K/mo', label: 'Ad Budget Managed' },
  { value: 3,   suffix: '+',      label: 'Years Experience' },
]

const platforms = [
  'Google Ads', 'Meta Ads', 'LinkedIn Ads', 'TikTok Ads', 'GA4 & GTM', 'Looker Studio',
]

const pillars = [
  { icon: '🎯', title: 'Performance Marketing',   desc: 'Google, Meta, LinkedIn & TikTok campaigns optimised for real ROI.' },
  { icon: '📊', title: 'Analytics & Tracking',    desc: 'GA4, GTM, and Looker Studio dashboards that drive decisions.' },
  { icon: '🤝', title: 'Key Account Management',  desc: 'End-to-end client relationships built on trust and growth.' },
]

export default function Home() {
  const [services,      setServices]      = useState([])
  const [featuredCase,  setFeaturedCase]  = useState(null)

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).limit(3)
      .then(({ data }) => { if (data?.length) setServices(data) })

    supabase.from('case_studies').select('*')
      .eq('is_featured', true).eq('is_published', true).limit(1)
      .then(({ data }) => { if (data?.length) setFeaturedCase(data[0]) })
  }, [])

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_60%_40%,rgba(255,105,51,0.07),transparent)]" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl"
             style={{ background: 'rgba(255,105,51,0.05)' }} />

        <div className="relative section-wrap py-20 w-full">
          <div className="max-w-3xl">

            {/* Available badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-8"
                 style={{
                   backgroundColor: 'var(--accent-muted)',
                   borderColor: 'var(--accent-border)',
                 }}>
              <span className="pulse-dot" />
              <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                Available for new projects
              </span>
            </div>

            <h1 className="heading-display text-deep mb-6">
              I Help Brands Grow with{' '}
              <span className="text-gradient">Performance Marketing</span>
            </h1>

            <p className="text-body text-gray-500 mb-10 max-w-2xl">
              3+ years &middot; 40+ clients &middot; $12K/mo managed &middot; 10x peak ROAS
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/portfolio" className="btn-primary btn-lg">
                View My Work
              </Link>
              <Link href="/contact" className="btn-secondary btn-lg">
                Let&rsquo;s Talk
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="section-wrap">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {stats.map(s => <StatCounter key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── Platforms ────────────────────────────────────────────── */}
      <section className="py-14 bg-soft">
        <div className="section-wrap">
          <p className="text-center eyebrow mb-8">Platforms I work with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {platforms.map(p => (
              <span key={p}
                    className="px-4 py-2 text-body-sm font-semibold text-gray-500 bg-white border border-gray-200 rounded-full hover:border-accent/40 hover:text-deep transition-colors">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="section-wrap">
          <SectionHeader
            eyebrow="What I Do"
            title="Services Built for Growth"
            subtitle="Performance-driven marketing tailored to your goals."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(services.length ? services : pillars).map((s, i) => (
              <div key={s.id || i}
                   className="card-interactive p-6 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-xl transition-colors"
                     style={{ backgroundColor: 'var(--accent-muted)' }}>
                  {s.icon || pillars[i % pillars.length].icon}
                </div>
                <h3 className="heading-section mb-2">{s.title}</h3>
                <p className="text-body text-gray-500 mb-5 leading-relaxed">
                  {s.description || s.desc}
                </p>
                <Link href="/services"
                      className="text-body-sm font-bold inline-flex items-center gap-1 transition-all group-hover:gap-2"
                      style={{ color: 'var(--accent)' }}>
                  Learn more <span>&rarr;</span>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/services" className="btn-ghost btn-md border border-gray-200 hover:border-gray-300">
              View all services &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Case Study ───────────────────────────────────── */}
      {featuredCase && (
        <section className="py-20 bg-soft">
          <div className="section-wrap">
            <SectionHeader eyebrow="Featured Work" title="Case Study" />

            <div className="card-interactive p-8 max-w-2xl">
              <span className="badge-accent">{featuredCase.industry}</span>
              <h3 className="heading-section mt-4 mb-3">{featuredCase.title}</h3>
              <p className="text-body text-gray-500 mb-6 leading-relaxed">
                {featuredCase.challenge?.substring(0, 180)}&hellip;
              </p>

              {featuredCase.key_metrics && (
                <div className="grid grid-cols-2 gap-5 mb-6 py-6 divider border-b border-gray-100">
                  {Object.entries(featuredCase.key_metrics).slice(0, 4).map(([k, v]) => (
                    <div key={k}>
                      <div className="text-price-val" style={{ color: 'var(--accent)' }}>{v}</div>
                      <div className="text-body-sm text-gray-500 mt-0.5">{k}</div>
                    </div>
                  ))}
                </div>
              )}

              <Link href={`/portfolio/${featuredCase.id}`}
                    className="text-body-sm font-bold transition-colors"
                    style={{ color: 'var(--accent)' }}>
                Read full case study &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: 'var(--accent)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_70%)]" />
        <div className="relative section-tight text-center">
          <h2 className="heading-display text-white mb-4">
            Ready to Scale Your Growth?
          </h2>
          <p className="text-body text-white/80 mb-10">
            Let&rsquo;s build a performance marketing strategy that drives real, measurable results.
          </p>
          <Link
            href="/contact"
            className="inline-block btn btn-xl bg-white font-extrabold hover:-translate-y-px hover:shadow-xl transition-all"
            style={{ color: 'var(--accent)' }}
          >
            Start a Conversation
          </Link>
        </div>
      </section>

    </div>
  )
}
