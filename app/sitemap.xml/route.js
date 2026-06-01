import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const now = new Date().toISOString()

  const staticPages = [
    { url: baseUrl,                     freq: 'weekly',  priority: '1.0' },
    { url: `${baseUrl}/about`,          freq: 'monthly', priority: '0.9' },
    { url: `${baseUrl}/services`,       freq: 'weekly',  priority: '0.9' },
    { url: `${baseUrl}/blog`,           freq: 'daily',   priority: '0.8' },
    { url: `${baseUrl}/gigs`,           freq: 'weekly',  priority: '0.8' },
    { url: `${baseUrl}/portfolio`,      freq: 'monthly', priority: '0.7' },
    { url: `${baseUrl}/case-studies`,   freq: 'monthly', priority: '0.7' },
    { url: `${baseUrl}/certifications`, freq: 'monthly', priority: '0.6' },
    { url: `${baseUrl}/contact`,        freq: 'monthly', priority: '0.7' },
  ]

  let dynamicPages = []

  try {
    const { supabase } = await import('@/lib/supabase')

    const [
      { data: services },
      { data: posts },
      { data: gigs },
      { data: cases },
    ] = await Promise.all([
      supabase.from('services').select('slug, updated_at').eq('is_active', true).not('slug', 'is', null),
      supabase.from('articles').select('slug, updated_at').eq('is_published', true).not('slug', 'is', null),
      supabase.from('gigs').select('id, updated_at').eq('is_active', true),
      supabase.from('case_studies').select('id, updated_at').eq('is_published', true),
    ])

    ;(services || []).filter(s => s.slug).forEach(s => dynamicPages.push({
      url: `${baseUrl}/services/${s.slug}`,
      lastmod: s.updated_at ? s.updated_at.slice(0, 10) : now.slice(0, 10),
      freq: 'monthly', priority: '0.8',
    }))
    ;(posts || []).filter(p => p.slug).forEach(p => dynamicPages.push({
      url: `${baseUrl}/blog/${p.slug}`,
      lastmod: p.updated_at ? p.updated_at.slice(0, 10) : now.slice(0, 10),
      freq: 'weekly', priority: '0.7',
    }))
    ;(gigs || []).forEach(g => dynamicPages.push({
      url: `${baseUrl}/gigs/${g.id}`,
      lastmod: g.updated_at ? g.updated_at.slice(0, 10) : now.slice(0, 10),
      freq: 'monthly', priority: '0.7',
    }))
    ;(cases || []).forEach(c => dynamicPages.push({
      url: `${baseUrl}/case-studies/${c.id}`,
      lastmod: c.updated_at ? c.updated_at.slice(0, 10) : now.slice(0, 10),
      freq: 'monthly', priority: '0.7',
    }))
  } catch { /* use static only */ }

  const allPages = [
    ...staticPages.map(p => ({ ...p, lastmod: now.slice(0, 10) })),
    ...dynamicPages,
  ]

  const urlEntries = allPages.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap-styled.xml"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
