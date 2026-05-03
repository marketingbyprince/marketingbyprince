import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function CaseStudy() {
  const { id } = useParams()
  const [cs, setCs] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('case_studies').select('*').eq('id', id).single()
      .then(({ data }) => { setCs(data); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!cs) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Case study not found.</p>
        <Link to="/portfolio" className="text-blue-400 hover:underline">← Back to Portfolio</Link>
      </div>
    </div>
  )

  const sections = [
    { label: 'The Challenge', icon: '🎯', content: cs.challenge },
    { label: 'Strategy', icon: '🗺️', content: cs.strategy },
    { label: 'Execution', icon: '⚡', content: cs.execution },
    { label: 'Results', icon: '📈', content: cs.results },
  ]

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link to="/portfolio" className="text-gray-500 hover:text-white text-sm flex items-center gap-1 mb-8 transition-colors">
          ← Back to Portfolio
        </Link>

        {cs.cover_image_url && (
          <img src={cs.cover_image_url} alt={cs.title} className="w-full h-64 object-cover rounded-2xl mb-10" />
        )}

        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">{cs.industry}</span>
            {cs.is_featured && <span className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">Featured</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{cs.title}</h1>
          <p className="text-gray-400">Client: <span className="text-white">{cs.client_name}</span></p>
        </div>

        {/* Key Metrics */}
        {cs.key_metrics && Object.keys(cs.key_metrics).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 p-6 bg-[#111827] rounded-2xl border border-gray-800">
            {Object.entries(cs.key_metrics).map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="text-3xl font-extrabold text-blue-400 mb-1">{v}</div>
                <div className="text-gray-400 text-xs font-medium">{k}</div>
              </div>
            ))}
          </div>
        )}

        {/* Sections */}
        <div className="space-y-10">
          {sections.filter(s => s.content).map(section => (
            <div key={section.label}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-xl">{section.icon}</span>
                <h2 className="text-xl font-bold text-white">{section.label}</h2>
              </div>
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-2">Want results like this?</h3>
          <p className="text-gray-400 mb-6">Let's build a strategy for your brand.</p>
          <Link to="/contact" className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors">
            Start a Conversation
          </Link>
        </div>
      </div>
    </div>
  )
}
