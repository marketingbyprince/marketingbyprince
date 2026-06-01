import { xmlResponse, htmlResponse, notFoundXmlResponse, buildUrlset, buildHtmlUrlset, isBrowserRequest } from '@/lib/sitemap-helpers'

export async function GET(request) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)
  const isBrowser = isBrowserRequest(request)

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
    const xml = buildUrlset(pages)
    if (!xml) return notFoundXmlResponse()
    return xmlResponse(xml)
  } catch {
    if (isBrowser) return htmlResponse(buildHtmlUrlset([], '📊 Case Studies Sitemap', `${baseUrl}/sitemap.xml`))
    return notFoundXmlResponse()
  }
}
