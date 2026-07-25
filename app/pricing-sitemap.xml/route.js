import { xmlResponse, buildUrlset } from '@/lib/sitemap-helpers'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)

  const pages = [{ url: `${baseUrl}/pricing`, lastmod: today, freq: 'weekly', priority: '0.8' }]

  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { data: gigs } = await supabaseAdmin
      .from('gigs').select('slug, updated_at')
      .eq('is_active', true).not('slug', 'is', null)

    ;(gigs || []).forEach(g => pages.push({
      url: `${baseUrl}/pricing/${g.slug}`,
      lastmod: g.updated_at ? g.updated_at.slice(0, 10) : today,
      freq: 'monthly', priority: '0.8',
    }))
  } catch { /* fallback: just /pricing */ }

  return xmlResponse(buildUrlset(pages))
}
