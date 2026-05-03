import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StatCounter from '../components/StatCounter'

const stats = [
  { value: 40, suffix: '+', label: 'Client Accounts' },
  { value: 10, suffix: 'x', label: 'Peak ROAS' },
  { value: 12, prefix: '$', suffix: 'K/mo', label: 'Ad Budget Managed' },
  { value: 3, suffix: '+', label: 'Years Experience' },
]

const platforms = ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'TikTok Ads', 'GA4 & GTM', 'Looker Studio']

const pillars = [
  { icon: '🎯', title: 'Performance Marketing', desc: 'Google, Meta, LinkedIn & TikTok campaigns optimised for real ROI.' },
  { icon: '📊', title: 'Analytics & Tracking', desc: 'GA4, GTM, and Looker Studio dashboards that drive decisions.' },
  { icon: '🤝', title: 'Key Account Management', desc: 'End-to-end client relationships built on trust and growth.' },
]

export default function Home() {
  const [services, setServices] = useState([])
  const [featuredCase, setFeaturedCase] = useState(null)

  useEffect(() => {
    supabase.from('services').select('*').eq('is_active', true).limit(3)
      .then(({ data }) => { if (data?.length) setServices(data) })

    supabase.from('case_studies').select('*')
      .eq('is_featured', true).eq('is_published', true).limit(1)
      .then(({ data }) => { if (data?.length) setFeaturedCase(data[0]) })
  }, [])

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#0D1628] to-[#0A0F1E]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_30%,rgba(59,130,246,0.12),transparent)]" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Available for new projects
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.08]">
              I Help Brands Grow with{' '}
              <span className="text-gradient">Performance Marketing</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
              3+ years · 40+ clients · $12K/mo managed · 10x peak ROAS
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/portfolio"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
              >
                View My Work
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 border border-gray-700 hover:border-blue-500/60 text-gray-300 hover:text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5"
              >
                Let's Talk
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-[#111827] border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {stats.map(s => <StatCounter key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── Platforms ── */}
      <section className="py-14 bg-[#0A0F1E]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-600 text-xs font-semibold uppercase tracking-widest mb-8">
            Platforms I work with
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {platforms.map(p => (
              <span key={p} className="px-4 py-2 text-sm text-gray-400 border border-gray-800 rounded-full hover:border-blue-500/40 hover:text-gray-300 transition-colors">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-20 bg-[#0A0F1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">What I Do</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-3">Services Built for Growth</h2>
            <p className="text-gray-400">Performance-driven marketing tailored to your goals.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(services.length ? services : pillars).map((s, i) => (
              <div
                key={s.id || i}
                className="bg-[#111827] border border-gray-800 rounded-2xl p-6 hover:border-blue-500/40 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-5 text-xl group-hover:bg-blue-500/20 transition-colors">
                  {s.icon || pillars[i % pillars.length].icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.description || s.desc}</p>
                <Link to="/services" className="text-blue-400 text-sm mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Learn more <span>→</span>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/services" className="text-gray-400 hover:text-white text-sm transition-colors border border-gray-800 hover:border-gray-700 px-6 py-2.5 rounded-lg">
              View all services →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Case Study ── */}
      {featuredCase && (
        <section className="py-20 bg-[#111827]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Featured Work</span>
              <h2 className="text-3xl font-bold text-white mt-2">Case Study</h2>
            </div>
            <div className="bg-[#0A0F1E] border border-gray-800 rounded-2xl p-8 max-w-2xl hover:border-blue-500/30 transition-all">
              <span className="text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full font-medium">
                {featuredCase.industry}
              </span>
              <h3 className="text-2xl font-bold text-white mt-4 mb-3">{featuredCase.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {featuredCase.challenge?.substring(0, 180)}…
              </p>
              {featuredCase.key_metrics && (
                <div className="grid grid-cols-2 gap-5 mb-6 py-6 border-y border-gray-800">
                  {Object.entries(featuredCase.key_metrics).slice(0, 4).map(([k, v]) => (
                    <div key={k}>
                      <div className="text-2xl font-bold text-blue-400">{v}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{k}</div>
                    </div>
                  ))}
                </div>
              )}
              <Link to={`/portfolio/${featuredCase.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                Read full case study →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-24 bg-[#0A0F1E] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Ready to Scale Your Growth?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Let's build a performance marketing strategy that drives real, measurable results.
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5"
          >
            Start a Conversation
          </Link>
        </div>
      </section>
    </div>
  )
}
