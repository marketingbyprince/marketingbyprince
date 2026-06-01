import { xmlResponse, buildUrlset } from '@/lib/sitemap-helpers'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)

  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: services } = await supabase
      .from('services')
      .select('slug, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null)

    const pages = (services || []).map(s => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastmod: s.updated_at ? s.updated_at.slice(0, 10) : today,
      freq: 'monthly',
      priority: '0.8',
    }))

    return xmlResponse(buildUrlset(pages))
  } catch {
    return xmlResponse(buildUrlset([]))
  }
}
