import { xmlResponse, htmlResponse, buildUrlset, buildHtmlUrlset } from '@/lib/sitemap-helpers'

export async function GET(request) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)
  const isBrowser = (request.headers.get('accept') || '').includes('text/html')

  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: cases } = await supabase
      .from('case_studies').select('id, updated_at')
      .eq('is_published', true)

    const pages = (cases || []).map(c => ({
      url: `${baseUrl}/case-studies/${c.id}`,
      lastmod: c.updated_at ? c.updated_at.slice(0, 10) : today,
      freq: 'monthly', priority: '0.7',
    }))

    if (isBrowser) return htmlResponse(buildHtmlUrlset(pages, '📊 Case Studies Sitemap', `${baseUrl}/sitemap.xml`))
    return xmlResponse(buildUrlset(pages))
  } catch {
    if (isBrowser) return htmlResponse(buildHtmlUrlset([], '📊 Case Studies Sitemap', `${baseUrl}/sitemap.xml`))
    return xmlResponse(buildUrlset([]))
  }
}
