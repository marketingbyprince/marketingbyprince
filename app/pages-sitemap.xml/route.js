import { xmlResponse, htmlResponse, buildUrlset, buildHtmlUrlset, isBrowserRequest } from '@/lib/sitemap-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)
  const isBrowser = isBrowserRequest(request)

  const pages = [
    { url: baseUrl,                          freq: 'weekly',  priority: '1.0', lastmod: today },
    { url: `${baseUrl}/about`,               freq: 'monthly', priority: '0.9', lastmod: today },
    { url: `${baseUrl}/services`,            freq: 'weekly',  priority: '0.9', lastmod: today },
    { url: `${baseUrl}/blog`,                freq: 'daily',   priority: '0.8', lastmod: today },
    { url: `${baseUrl}/gigs`,                freq: 'weekly',  priority: '0.8', lastmod: today },
    { url: `${baseUrl}/portfolio`,           freq: 'monthly', priority: '0.7', lastmod: today },
    { url: `${baseUrl}/case-studies`,        freq: 'monthly', priority: '0.7', lastmod: today },
    { url: `${baseUrl}/certifications`,      freq: 'monthly', priority: '0.6', lastmod: today },
    { url: `${baseUrl}/contact`,             freq: 'monthly', priority: '0.7', lastmod: today },
  ]

  if (isBrowser) return htmlResponse(buildHtmlUrlset(pages, '📄 Pages Sitemap', `${baseUrl}/sitemap.xml`))
  return xmlResponse(buildUrlset(pages))
}
