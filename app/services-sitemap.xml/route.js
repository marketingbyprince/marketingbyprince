import { xmlResponse, buildUrlset } from '@/lib/sitemap-helpers'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)

  const pages = [{ url: `${baseUrl}/services`, lastmod: today, freq: 'weekly', priority: '0.9' }]

  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { data: services } = await supabaseAdmin
      .from('services').select('slug, updated_at')
      .eq('is_active', true).not('slug', 'is', null)

    ;(services || []).forEach(s => pages.push({
      url: `${baseUrl}/services/${s.slug}`,
      lastmod: s.updated_at ? s.updated_at.slice(0, 10) : today,
      freq: 'monthly', priority: '0.8',
    }))
  } catch { /* fallback: just /services */ }

  return xmlResponse(buildUrlset(pages))
}
