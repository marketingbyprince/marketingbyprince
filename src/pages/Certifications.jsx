import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const fallback = [
  { name: 'Google Ads Certification', issuer: 'Google Skillshop', issue_date: '2024-01-01' },
  { name: 'Digital Marketing Certification', issuer: 'Google', issue_date: '2023-06-01' },
]

export default function Certifications() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('certifications').select('*').eq('is_active', true).order('issue_date', { ascending: false })
      .then(({ data }) => { setCerts(data?.length ? data : fallback); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Certifications</span>
          <h1 className="text-4xl font-bold text-white mt-2 mb-3">Credentials & Certifications</h1>
          <p className="text-gray-400">Verified qualifications from leading platforms and institutions.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certs.map((cert, i) => (
              <div
                key={cert.id || i}
                className="bg-[#111827] border border-gray-800 rounded-2xl p-6 hover:border-blue-500/40 transition-all group"
              >
                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors">
                  {cert.badge_image_url ? (
                    <img src={cert.badge_image_url} alt={cert.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <span className="text-2xl">🏆</span>
                  )}
                </div>
                <h3 className="text-white font-semibold mb-1.5 leading-snug">{cert.name}</h3>
                <p className="text-blue-400 text-sm mb-2">{cert.issuer}</p>
                {cert.issue_date && (
                  <p className="text-gray-500 text-xs">
                    Issued {new Date(cert.issue_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                )}
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-blue-400 text-xs font-medium hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    View Credential <span>↗</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
