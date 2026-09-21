import { xmlResponse, buildUrlset } from '@/lib/sitemap-helpers'
import { SITE_URL } from '@/lib/site'

export async function GET() {
  const baseUrl = SITE_URL
  const today = new Date().toISOString().slice(0, 10)

  const pages = [{ url: `${baseUrl}/services`, lastmod: today, freq: 'weekly', priority: '0.9' }]

  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    // services has no updated_at column — created_at is the closest it has.
    const { data: services } = await supabaseAdmin
      .from('services').select('slug, created_at')
      .eq('is_active', true).not('slug', 'is', null)
      // performance-marketing is already listed in pages-sitemap.xml
      .neq('slug', 'performance-marketing')

    ;(services || []).forEach(s => pages.push({
      url: `${baseUrl}/services/${s.slug}`,
      lastmod: s.created_at ? s.created_at.slice(0, 10) : today,
      freq: 'monthly', priority: '0.8',
    }))
  } catch { /* fallback: just /services */ }

  return xmlResponse(buildUrlset(pages))
}
