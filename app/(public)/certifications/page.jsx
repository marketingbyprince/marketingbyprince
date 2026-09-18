import CertificationsClient from './CertificationsClient'
import { supabase } from '@/lib/supabase'
import { getSeoMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const fallback = [
  { name: 'Google Ads Certification',     issuer: 'Google Skillshop', issue_date: '2024-01-01' },
  { name: 'Digital Marketing Certification', issuer: 'Google',        issue_date: '2023-06-01' },
]

async function getCertifications() {
  const { data } = await supabase.from('certifications').select('*').eq('is_active', true)
    .order('issue_date', { ascending: false })
  return data?.length ? data : fallback
}

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'certifications',
    fallback: {
      title: 'Certifications | Prince Pandey | Google, Meta Certified',
      description: 'Professional certifications in Google Ads, Meta Blueprint, and digital marketing by Prince Pandey.',
      path: '/certifications',
    },
  })
}

export default async function Page() {
  const certs = await getCertifications()
  return <CertificationsClient initialCerts={certs} />
}
