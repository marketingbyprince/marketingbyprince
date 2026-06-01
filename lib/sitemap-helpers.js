import { NextResponse } from 'next/server'

export function xmlResponse(xml) {
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}

export function buildUrlset(pages) {
  const entries = pages.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap-styled.xml"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries}
</urlset>`
}
