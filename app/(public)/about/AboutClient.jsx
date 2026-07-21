'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateResume } from '@/lib/resumeUtils'
import SectionHeader from '@/components/ui/SectionHeader'


const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function fmtDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}

export default function AboutClient() {
  const [about,      setAbout]      = useState(null)
  const [experience, setExperience] = useState([])
  const [skills,     setSkills]     = useState([])
  const [education,  setEducation]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('about_content').select('*').single(),
      supabase.from('work_experience').select('*').order('sort_order'),
      supabase.from('skills').select('*').order('category').order('sort_order'),
      supabase.from('education').select('*').order('sort_order'),
    ]).then(([a, e, s, ed]) => {
      setAbout(a.data)
      setExperience(e.data || [])
      setSkills(s.data || [])
      setEducation(ed.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleDownloadResume = async () => {
    setGenerating(true)
    try { await generateResume() } catch (e) { console.error(e) }
    setGenerating(false)
  }

  const groupedSkills = skills.reduce((acc, s) => {
    const cat = s.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-soft flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-soft">
      <div className="section-narrow">

        {/* ── Bio ─────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-12 mb-20">
          <div className="md:col-span-1 flex flex-col items-center md:items-start gap-5">
            {about?.profile_image_url ? (
              <div className="w-36 h-36 rounded-2xl border-2 overflow-hidden" style={{ borderColor: 'var(--accent-border)' }}>
                <img
                  src={about.profile_image_url}
                  alt={`${about?.name} — professional headshot`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-36 h-36 rounded-2xl border-2 flex items-center justify-center text-5xl"
                   style={{ background: 'var(--accent-muted)', borderColor: 'var(--accent-border)' }}>
                👨‍💼
              </div>
            )}

            <button
              onClick={handleDownloadResume}
              disabled={generating}
              className="w-full text-center btn-primary btn-md disabled:opacity-70"
            >
              {generating ? 'Generating…' : '⬇ Download Resume'}
            </button>

            {about?.phone && (
              <a href={`tel:${about.phone}`} className="w-full text-center btn-secondary btn-md">
                📞 {about.phone}
              </a>
            )}
            {about?.email && (
              <a href={`mailto:${about.email}`} className="w-full text-center btn-secondary btn-md">
                ✉ {about.email}
              </a>
            )}
          </div>

          <div className="md:col-span-2">
            <span className="eyebrow mb-3">About Me</span>
            <h1 className="heading-display text-deep mb-2">{about?.name || 'Prince Pandey'}</h1>
            {about?.tagline && (
              <p className="text-body font-semibold mb-4" style={{ color: 'var(--accent)' }}>{about.tagline}</p>
            )}
            {about?.description && (
              <p className="text-body text-gray-600 leading-relaxed">{about.description}</p>
            )}

            {about?.is_location_visible && about?.location && (
              <div className="flex items-center gap-2 text-body-sm text-gray-500 font-medium mt-6">
                <span>📍</span> {about.location}
              </div>
            )}
          </div>
        </div>

        {/* ── Experience ──────────────────────────────────────────────── */}
        {experience.length > 0 && (
          <div className="mb-20">
            <SectionHeader eyebrow="Experience" title="Work History" />
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-8">
                {experience.map((job) => (
                  <div key={job.id} className="relative pl-12">
                    <div
                      className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 ${job.is_current ? 'border-accent' : 'bg-white border-gray-200'}`}
                      style={job.is_current ? { backgroundColor: 'var(--accent)' } : {}}
                    >
                      {job.is_current
                        ? <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        : <span className="w-2 h-2 bg-gray-300 rounded-full" />
                      }
                    </div>
                    <div className="card p-6">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="heading-section">{job.role}</h3>
                          <p className="text-body-sm font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>{job.company}</p>
                        </div>
                        <span className={`badge ${job.is_current ? 'badge-green' : 'badge-gray'}`}>
                          {fmtDate(job.start_date)} – {job.is_current ? 'Present' : fmtDate(job.end_date)}
                        </span>
                      </div>
                      {job.description && (
                        <ul className="space-y-1.5 mt-2">
                          {job.description.split(/\.\s+|•\s*|\n/).filter(b => b.trim().length > 3).map((b, i) => (
                            <li key={i} className="text-body text-gray-500 flex gap-2">
                              <span className="shrink-0 mt-1 font-bold" style={{ color: 'var(--accent)' }}>›</span>
                              {b.trim().replace(/\.$/, '')}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Skills ──────────────────────────────────────────────────── */}
        {skills.length > 0 && (
          <div className="mb-20">
            <SectionHeader eyebrow="Skills" title="Tools & Expertise" />
            <div className="space-y-4">
              {Object.entries(groupedSkills).map(([cat, catSkills]) => (
                <div key={cat}>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map(s => (
                      <span key={s.id} className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-body-sm font-semibold text-gray-600 hover:border-accent/40 hover:text-deep transition-all">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Education ────────────────────────────────────────────────── */}
        {education.length > 0 && (
          <div>
            <SectionHeader eyebrow="Education" title="Academic Background" />
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id} className="card p-6 inline-flex flex-col gap-1 w-full">
                  <h3 className="heading-section">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</h3>
                  <p className="text-body-sm font-semibold mt-1" style={{ color: 'var(--accent)' }}>
                    {edu.institution} &middot; {edu.start_year}{edu.end_year || edu.is_current ? ` – ${edu.is_current ? 'Ongoing' : edu.end_year}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
