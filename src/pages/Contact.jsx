import { useState } from 'react'
import { supabase } from '../lib/supabase'
import SectionHeader from '../components/ui/SectionHeader'

const budgetOptions = [
  'Under ₹10K/mo',
  '₹10K – ₹25K/mo',
  '₹25K – ₹50K/mo',
  '₹50K – ₹1L/mo',
  'Above ₹1L/mo',
  'Not sure yet',
]

const contactDetails = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'marketingbyprince@gmail.com',
    href: 'mailto:marketingbyprince@gmail.com',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Phone',
    value: '+91 9465992412',
    href: 'tel:+919465992412',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'LinkedIn',
    value: 'marketingbyprince',
    href: 'https://linkedin.com/in/marketingbyprince',
    external: true,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Location',
    value: 'Panchkula, Haryana',
    href: null,
  },
]

export default function Contact() {
  const [form,   setForm]   = useState({ name: '', email: '', company: '', budget_range: '', message: '' })
  const [status, setStatus] = useState('idle')

  const handleChange  = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit  = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('loading')
    const { error } = await supabase.from('leads').insert([{
      ...form, source_page: '/contact', is_read: false,
    }])
    setStatus(error ? 'error' : 'success')
  }

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-narrow">

        <SectionHeader
          eyebrow="Get In Touch"
          title="Let's Work Together"
          subtitle="Fill out the form and I'll get back to you within 24 hours."
        />

        <div className="grid md:grid-cols-5 gap-12">

          {/* ── Form ──────────────────────────────────────────────── */}
          <div className="md:col-span-3" id="contact-form">
            {status === 'success' ? (
              <div className="card p-10 text-center"
                   style={{ backgroundColor: 'var(--accent-muted)', borderColor: 'var(--accent-border)' }}>
                <div className="text-5xl mb-4">✅</div>
                <h3 className="heading-section mb-2">Message Sent!</h3>
                <p className="text-body text-gray-500">
                  Thanks for reaching out. I&rsquo;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="input-label">Name *</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange}
                           required placeholder="Your name" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Email *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                           required placeholder="you@company.com" className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="input-label">Company</label>
                  <input type="text" name="company" value={form.company} onChange={handleChange}
                         placeholder="Your company (optional)" className="input-field" />
                </div>

                <div>
                  <label className="input-label">Monthly Budget</label>
                  <select name="budget_range" value={form.budget_range} onChange={handleChange}
                          className="input-field appearance-none">
                    <option value="">Select a range</option>
                    {budgetOptions.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="input-label">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange}
                            required rows={5}
                            placeholder="Tell me about your project and goals..."
                            className="input-field resize-none" />
                </div>

                {status === 'error' && (
                  <p className="text-red-600 text-body-sm font-medium">
                    Something went wrong. Please try again or email me directly.
                  </p>
                )}

                <button type="submit" disabled={status === 'loading'}
                        className="btn-primary btn-lg w-full justify-center">
                  {status === 'loading' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* ── Aside ─────────────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-5">
            <div className="card p-6">
              <h3 className="heading-section mb-5">Contact Details</h3>
              <div className="space-y-4">
                {contactDetails.map(({ icon, label, value, href, external }) => {
                  const inner = (
                    <div className="flex items-center gap-3 group transition-colors text-gray-500 hover:text-deep">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                            style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
                        {icon}
                      </span>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                        <p className="text-body-sm font-semibold">{value}</p>
                      </div>
                    </div>
                  )

                  if (!href) return <div key={label}>{inner}</div>
                  return (
                    <a key={label} href={href}
                       {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      {inner}
                    </a>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl p-5"
                 style={{ backgroundColor: 'var(--warn-canvas)', border: '1px solid var(--warn-border)' }}>
              <p className="text-sm font-bold text-amber-800 mb-1">⚡ Typical response time</p>
              <p className="text-body-sm text-amber-700">Within 24 hours on weekdays</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
