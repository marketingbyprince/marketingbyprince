import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SectionHeader from '../components/ui/SectionHeader'

const fallback = [
  { name: 'Google Ads Certification',     issuer: 'Google Skillshop', issue_date: '2024-01-01' },
  { name: 'Digital Marketing Certification', issuer: 'Google',        issue_date: '2023-06-01' },
]

export default function Certifications() {
  const [certs,   setCerts]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('certifications').select('*').eq('is_active', true)
      .order('issue_date', { ascending: false })
      .then(({ data }) => { setCerts(data?.length ? data : fallback); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-24 bg-soft">
      <div className="section-narrow">

        <SectionHeader
          eyebrow="Certifications"
          title="Credentials & Certifications"
          subtitle="Verified qualifications from leading platforms and institutions."
        />

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certs.map((cert, i) => (
              <div key={cert.id || i} className="card-interactive p-6 group">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors"
                     style={{ backgroundColor: 'var(--accent-muted)' }}>
                  {cert.badge_image_url ? (
                    <img src={cert.badge_image_url} alt={cert.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <span className="text-2xl">🏆</span>
                  )}
                </div>
                <h3 className="heading-section mb-1.5 leading-snug">{cert.name}</h3>
                <p className="text-body-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                  {cert.issuer}
                </p>
                {cert.issue_date && (
                  <p className="text-xs text-gray-400 font-medium">
                    Issued {new Date(cert.issue_date).toLocaleDateString('en-IN', {
                      month: 'long', year: 'numeric',
                    })}
                  </p>
                )}
                {cert.credential_url && (
                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer"
                     className="mt-4 text-body-sm font-bold flex items-center gap-1 transition-colors hover:underline"
                     style={{ color: 'var(--accent)' }}>
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
