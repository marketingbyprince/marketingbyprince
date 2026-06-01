import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const now = new Date().toISOString().slice(0, 10)

  const sitemaps = [
    { loc: `${baseUrl}/pages-sitemap.xml`,       lastmod: now },
    { loc: `${baseUrl}/gigs-sitemap.xml`,         lastmod: now },
    { loc: `${baseUrl}/services-sitemap.xml`,     lastmod: now },
    { loc: `${baseUrl}/blog-sitemap.xml`,         lastmod: now },
    { loc: `${baseUrl}/case-studies-sitemap.xml`, lastmod: now },
  ]

  const entries = sitemaps.map(s => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap-styled.xml"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
