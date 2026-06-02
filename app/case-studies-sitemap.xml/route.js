import { NextResponse } from 'next/server'
import { xmlResponse, htmlResponse, buildUrlset, buildHtmlUrlset, isBrowserRequest } from '@/lib/sitemap-helpers'

export const dynamic = 'force-dynamic'

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

    if (pages.length === 0) return new NextResponse(null, { status: 404 })
    if (isBrowser) return htmlResponse(buildHtmlUrlset(pages, '📊 Case Studies Sitemap', `${baseUrl}/sitemap.xml`))
    return xmlResponse(buildUrlset(pages))
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
