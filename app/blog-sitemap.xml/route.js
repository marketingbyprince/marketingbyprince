import { xmlResponse, htmlResponse, buildUrlset, buildHtmlUrlset, isBrowserRequest } from '@/lib/sitemap-helpers'

export async function GET(request) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)
  const isBrowser = isBrowserRequest(request)

  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: posts } = await supabase
      .from('articles').select('slug, updated_at')
      .eq('is_published', true).not('slug', 'is', null)

    const pages = [
      { url: `${baseUrl}/blog`, lastmod: today, freq: 'weekly', priority: '0.8' },
      ...(posts || []).map(p => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastmod: p.updated_at ? p.updated_at.slice(0, 10) : today,
        freq: 'weekly', priority: '0.7',
      }))
    ]

    if (isBrowser) return htmlResponse(buildHtmlUrlset(pages, '✍️ Blog Sitemap', `${baseUrl}/sitemap.xml`))
    return xmlResponse(buildUrlset(pages))
  } catch {
    const fallback = [{ url: `${baseUrl}/blog`, lastmod: today, freq: 'weekly', priority: '0.8' }]
    if (isBrowser) return htmlResponse(buildHtmlUrlset(fallback, '✍️ Blog Sitemap', `${baseUrl}/sitemap.xml`))
    return xmlResponse(buildUrlset(fallback))
  }
}
