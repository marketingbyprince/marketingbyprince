import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Bio ── */}
        <div className="grid md:grid-cols-3 gap-12 mb-20">
          <div className="md:col-span-1 flex flex-col items-center md:items-start gap-5">
            <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center text-5xl">
              👨‍💼
            </div>
            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Download Resume
              </a>
            ) : (
              <Link to="/contact" className="w-full text-center px-4 py-2.5 border border-gray-700 hover:border-blue-500/60 text-gray-300 rounded-xl text-sm font-semibold transition-colors">
                Request Resume
              </Link>
            )}
          </div>

          <div className="md:col-span-2">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">About Me</span>
            <h1 className="text-4xl font-bold text-white mt-2 mb-6">Prince Pandey</h1>
            <p className="text-gray-300 leading-relaxed mb-4">
              Results-driven Key Account Manager with 3+ years of experience managing 40+ client accounts across digital marketing and performance advertising. Proven track record of driving revenue growth, client retention, and upselling — consistently generating $3,000–$4,000/month in incremental revenue through strategic account expansion.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Specialising in Google Ads, Meta, LinkedIn, and TikTok campaigns, I combine analytical rigour with creative strategy to deliver sustainable, scalable results for brands across SaaS, e-commerce, healthcare, automotive, and D2C verticals.
            </p>

            <div className="flex flex-wrap gap-2 mt-8">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>📍</span> Panchkula, Haryana
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm ml-4">
                <span>✉</span> marketingbyprince@gmail.com
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm ml-4">
                <span>📞</span> +91 9465992412
              </div>
            </div>
          </div>
        </div>

        {/* ── Experience Timeline ── */}
        <div className="mb-20">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Experience</span>
          <h2 className="text-2xl font-bold text-white mt-2 mb-10">Work History</h2>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />
            <div className="space-y-10">
              {experience.map((job, i) => (
                <div key={i} className="relative pl-12">
                  <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    job.current ? 'bg-blue-500 border-blue-500' : 'bg-[#111827] border-gray-700'
                  }`}>
                    {job.current ? (
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 bg-gray-600 rounded-full" />
                    )}
                  </div>

                  <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-white font-semibold">{job.role}</h3>
                        <p className="text-blue-400 text-sm">{job.company}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        job.current ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {job.period}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {job.bullets.map((b, j) => (
                        <li key={j} className="text-gray-400 text-sm flex gap-2">
                          <span className="text-blue-500 mt-1 shrink-0">›</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="mb-20">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Skills</span>
          <h2 className="text-2xl font-bold text-white mt-2 mb-8">Tools & Expertise</h2>
          <div className="flex flex-wrap gap-2.5">
            {skills.map(s => (
              <span key={s} className="px-3.5 py-1.5 bg-[#111827] border border-gray-800 rounded-full text-sm text-gray-300 hover:border-blue-500/50 hover:text-white transition-all">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* ── Education ── */}
        <div>
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Education</span>
          <h2 className="text-2xl font-bold text-white mt-2 mb-6">Academic Background</h2>
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 inline-flex flex-col gap-1">
            <h3 className="text-white font-semibold">B.Tech in Computer Science (Cyber Security)</h3>
            <p className="text-blue-400 text-sm">GNA University · 2023</p>
          </div>
        </div>
      </div>
    </div>
  )
}
