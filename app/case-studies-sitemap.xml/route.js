import { xmlResponse, buildUrlset } from '@/lib/sitemap-helpers'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)

  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: cases } = await supabase
      .from('case_studies')
      .select('id, updated_at')
      .eq('is_published', true)

    const pages = (cases || []).map(c => ({
      url: `${baseUrl}/case-studies/${c.id}`,
      lastmod: c.updated_at ? c.updated_at.slice(0, 10) : today,
      freq: 'monthly',
      priority: '0.7',
    }))

    return xmlResponse(buildUrlset(pages))
  } catch {
    return xmlResponse(buildUrlset([]))
  }
}
