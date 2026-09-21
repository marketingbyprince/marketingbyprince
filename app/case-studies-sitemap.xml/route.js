import { xmlResponse, buildUrlset } from '@/lib/sitemap-helpers'
import { SITE_URL } from '@/lib/site'

export async function GET() {
  const baseUrl = SITE_URL
  const today = new Date().toISOString().slice(0, 10)

  const pages = [{ url: `${baseUrl}/case-studies`, lastmod: today, freq: 'monthly', priority: '0.7' }]

  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { data: cases } = await supabaseAdmin
      .from('case_studies').select('id, slug, updated_at')
      .eq('is_published', true)

    ;(cases || []).forEach(c => pages.push({
      url: `${baseUrl}/case-studies/${c.slug || c.id}`,
      lastmod: c.updated_at ? c.updated_at.slice(0, 10) : today,
      freq: 'monthly', priority: '0.7',
    }))
  } catch { /* fallback: just /case-studies */ }

  return xmlResponse(buildUrlset(pages))
}
