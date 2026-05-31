import CaseStudyClient from './CaseStudyClient'

export async function generateMetadata({ params }) {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: cs } = await supabase
      .from('case_studies')
      .select('title, challenge, id')
      .eq('id', params.slug)
      .single()
    return {
      title: `${cs?.title || 'Case Study'} | Marketing By Prince`,
      description: cs?.challenge?.slice(0, 160),
      alternates: { canonical: `https://marketingbyprince.com/case-studies/${params.slug}` },
    }
  } catch {
    return { title: 'Case Study | Marketing By Prince' }
  }
}

export default function Page({ params }) {
  return <CaseStudyClient params={params} />
}
