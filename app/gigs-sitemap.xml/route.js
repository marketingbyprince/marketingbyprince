import { xmlResponse, htmlResponse, buildUrlset, buildHtmlUrlset } from '@/lib/sitemap-helpers'

export async function GET(request) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)
  const { isBrowserRequest } = await import('@/lib/sitemap-helpers')
  const isBrowser = isBrowserRequest(request)

  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: gigs } = await supabase
      .from('gigs').select('slug, updated_at')
      .eq('is_active', true).not('slug', 'is', null)

    const pages = (gigs || []).map(g => ({
      url: `${baseUrl}/gigs/${g.slug}`,
      lastmod: g.updated_at ? g.updated_at.slice(0, 10) : today,
      freq: 'monthly', priority: '0.8',
    }))

    if (isBrowser) return htmlResponse(buildHtmlUrlset(pages, '💼 Gigs Sitemap', `${baseUrl}/sitemap.xml`))
    return xmlResponse(buildUrlset(pages))
  } catch {
    if (isBrowser) return htmlResponse(buildHtmlUrlset([], '💼 Gigs Sitemap', `${baseUrl}/sitemap.xml`))
    return xmlResponse(buildUrlset([]))
  }
}
