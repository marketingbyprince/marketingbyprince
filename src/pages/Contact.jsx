import { useState } from 'react'
import { supabase } from '../lib/supabase'

const budgetOptions = [
  'Under ₹10K/mo',
  '₹10K – ₹25K/mo',
  '₹25K – ₹50K/mo',
  '₹50K – ₹1L/mo',
  'Above ₹1L/mo',
  'Not sure yet',
]

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', company: '', budget_range: '', message: '',
  })
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('loading')

    const { error } = await supabase.from('leads').insert([{
      ...form,
      source_page: '/contact',
      is_read: false,
    }])

    setStatus(error ? 'error' : 'success')
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Get In Touch</span>
          <h1 className="text-4xl font-bold text-white mt-2 mb-3">Let's Work Together</h1>
          <p className="text-gray-400">Fill out the form and I'll get back to you within 24 hours.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-12">

          {/* ── Form ── */}
          <div className="md:col-span-3" id="contact-form">
            {status === 'success' ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-white font-bold text-xl mb-2">Message Sent!</h3>
                <p className="text-gray-400">Thanks for reaching out. I'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@company.com"
                      className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Your company (optional)"
                    className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Monthly Budget</label>
                  <select
                    name="budget_range"
                    value={form.budget_range}
                    onChange={handleChange}
                    className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm appearance-none"
                  >
                    <option value="">Select a range</option>
                    {budgetOptions.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell me about your project and goals..."
                    className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-400 text-sm">Something went wrong. Please try again or email me directly.</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                >
                  {status === 'loading' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* ── Aside ── */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-5">Contact Details</h3>
              <div className="space-y-4">
                <a href="mailto:marketingbyprince@gmail.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                  <span className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center text-lg group-hover:bg-blue-500/20 transition-colors">✉</span>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="text-sm">marketingbyprince@gmail.com</p>
                  </div>
                </a>
                <a href="tel:+919465992412" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                  <span className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center text-lg group-hover:bg-blue-500/20 transition-colors">📞</span>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <p className="text-sm">+91 9465992412</p>
                  </div>
                </a>
                <a href="https://linkedin.com/in/marketingbyprince" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                  <span className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center text-lg group-hover:bg-blue-500/20 transition-colors">💼</span>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">LinkedIn</p>
                    <p className="text-sm">marketingbyprince</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center text-lg">📍</span>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Location</p>
                    <p className="text-sm">Panchkula, Haryana</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
              <p className="text-blue-300 text-sm font-medium mb-1">⚡ Typical response time</p>
              <p className="text-gray-400 text-sm">Within 24 hours on weekdays</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
