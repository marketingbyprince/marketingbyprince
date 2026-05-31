import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SectionHeader from '../components/ui/SectionHeader'

const experience = [
  {
    role: 'Key Account Manager (PPC)',
    company: 'WTechy Pvt Ltd',
    period: 'Sep 2025 – Present',
    current: true,
    bullets: [
      'Managing 40+ client accounts monthly across Google, Meta, LinkedIn & TikTok',
      'Driving $3,000–$4,000/month in incremental revenue through strategic upselling',
      'Optimising ad budgets up to $12K/month with consistent 3–5x ROAS, peaks of 10x',
      'Scaled leads from 6–7/week to 30–40/week via funnel restructuring',
    ],
  },
  {
    role: 'Digital Marketing Specialist',
    company: 'Pen Pundit Media Services',
    period: 'Feb 2025 – Sep 2025',
    current: false,
    bullets: [
      'Managed 6–10 client accounts end-to-end across SEO, PPC & client communication',
      'Administered $7,000–$8,500/month in ad budgets',
      'Delivered 60–70 quality leads for Anand Toyota via Google Ads & local search',
    ],
  },
  {
    role: 'Digital Marketing Executive',
    company: 'Jhanil Healthcare Pvt Ltd',
    period: 'Aug 2024 – Feb 2025',
    current: false,
    bullets: [
      'Managed integrated campaigns across Google Ads, Meta, SEO & WhatsApp Automation',
      'Achieved average ROAS of 5–6x for a healthcare brand',
      'Implemented WhatsApp automation workflows to reduce manual follow-up',
    ],
  },
  {
    role: 'Digital Marketing Executive',
    company: 'TheFuenix',
    period: 'Mar 2023 – Jun 2024',
    current: false,
    bullets: [
      'Built foundational expertise in SEO, paid search & multi-channel campaign strategy',
      'Supported end-to-end campaign planning and execution',
      'Earned early promotion to PPC Account Manager before probation ended',
    ],
  },
]

const skills = [
  'Google Ads', 'Meta Ads', 'LinkedIn Ads', 'TikTok Ads',
  'GA4', 'Google Tag Manager', 'Looker Studio', 'SEMrush',
  'Google Search Console', 'WhatsApp Automation', 'AI Automation',
  'Client Retention', 'Upselling', 'CRM Strategy', 'Funnel Optimisation',
  'Performance Reporting',
]

export default function About() {
  const [resumeUrl, setResumeUrl] = useState(null)

  useEffect(() => {
    supabase.from('resume').select('file_url').order('uploaded_at', { ascending: false }).limit(1)
      .then(({ data }) => { if (data?.[0]) setResumeUrl(data[0].file_url) })
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-20 bg-soft">
      <div className="section-narrow">

        {/* ── Bio ─────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-12 mb-20">
          <div className="md:col-span-1 flex flex-col items-center md:items-start gap-5">
            <div className="w-36 h-36 rounded-2xl border-2 overflow-hidden"
                 style={{
                   borderColor: 'var(--accent-border)',
                 }}>
              <img
                src="https://ywoynxlxddsxkrxmsvla.supabase.co/storage/v1/object/public/website-assets/Prince-Pandey/Prince%20Pandey%20Professional%20corporate%20headshot%20in%20office.png"
                alt="Prince Pandey — Professional corporate headshot"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                 className="w-full text-center btn-primary btn-md">
                Download Resume
              </a>
            ) : (
              <Link to="/contact"
                    className="w-full text-center btn-secondary btn-md">
                Request Resume
              </Link>
            )}
          </div>

          <div className="md:col-span-2">
            <span className="eyebrow mb-3">About Me</span>
            <h1 className="heading-display text-deep mb-6">Prince Pandey</h1>
            <p className="text-body text-gray-600 leading-relaxed mb-4">
              Results-driven Key Account Manager with 3+ years of experience managing 40+ client
              accounts across digital marketing and performance advertising. Proven track record of
              driving revenue growth, client retention, and upselling — consistently generating
              $3,000–$4,000/month in incremental revenue through strategic account expansion.
            </p>
            <p className="text-body text-gray-500 leading-relaxed">
              Specialising in Google Ads, Meta, LinkedIn, and TikTok campaigns, I combine analytical
              rigour with creative strategy to deliver sustainable, scalable results for brands across
              SaaS, e-commerce, healthcare, automotive, and D2C verticals.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8">
              {[
                { icon: '📍', text: 'Panchkula, Haryana' },
                { icon: '✉',  text: 'marketingbyprince@gmail.com' },
                { icon: '📞', text: '+91 9465992412' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-body-sm text-gray-500 font-medium">
                  <span>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Experience Timeline ──────────────────────────────────── */}
        <div className="mb-20">
          <SectionHeader eyebrow="Experience" title="Work History" />

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-8">
              {experience.map((job, i) => (
                <div key={i} className="relative pl-12">
                  <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    job.current ? 'border-accent' : 'bg-white border-gray-200'
                  }`}
                  style={job.current ? { backgroundColor: 'var(--accent)' } : {}}>
                    {job.current
                      ? <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      : <span className="w-2 h-2 bg-gray-300 rounded-full" />
                    }
                  </div>

                  <div className="card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="heading-section">{job.role}</h3>
                        <p className="text-body-sm font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>
                          {job.company}
                        </p>
                      </div>
                      <span className={`badge ${job.current ? 'badge-green' : 'badge-gray'}`}>
                        {job.period}
                      </span>
                    </div>
                    <ul className="space-y-1.5 mt-2">
                      {job.bullets.map((b, j) => (
                        <li key={j} className="text-body text-gray-500 flex gap-2">
                          <span className="shrink-0 mt-1 font-bold" style={{ color: 'var(--accent)' }}>›</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Skills ──────────────────────────────────────────────── */}
        <div className="mb-20">
          <SectionHeader eyebrow="Skills" title="Tools & Expertise" />
          <div className="flex flex-wrap gap-2.5">
            {skills.map(s => (
              <span key={s}
                    className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-body-sm font-semibold text-gray-600 hover:border-accent/40 hover:text-deep transition-all">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* ── Education ───────────────────────────────────────────── */}
        <div>
          <SectionHeader eyebrow="Education" title="Academic Background" />
          <div className="card p-6 inline-flex flex-col gap-1">
            <h3 className="heading-section">B.Tech in Computer Science (Cyber Security)</h3>
            <p className="text-body-sm font-semibold mt-1" style={{ color: 'var(--accent)' }}>
              GNA University &middot; 2023
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
