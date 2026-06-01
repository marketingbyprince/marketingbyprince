import { NextResponse } from 'next/server'

const XSL = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap — Marketing By Prince</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;color:#111827}
          header{background:#111827;padding:24px 32px;display:flex;align-items:center;gap:16px}
          .logo{width:36px;height:36px;background:#ff6933;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:13px;flex-shrink:0}
          header h1{color:#fff;font-size:18px;font-weight:700}
          header p{color:#9ca3af;font-size:13px;margin-top:2px}
          .container{max-width:1000px;margin:32px auto;padding:0 24px}
          .stats{display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap}
          .stat{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px 24px}
          .stat-num{font-size:28px;font-weight:800;color:#ff6933}
          .stat-label{font-size:12px;color:#6b7280;margin-top:2px}
          table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}
          thead tr{background:#111827}
          th{padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em}
          td{padding:12px 16px;font-size:13px;border-bottom:1px solid #f3f4f6}
          tr:last-child td{border-bottom:none}
          tr:hover td{background:#f9fafb}
          a{color:#ff6933;text-decoration:none;word-break:break-all}
          a:hover{text-decoration:underline}
          .pri{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700}
          .pri-high{background:#fef3ee;color:#ff6933}
          .pri-med{background:#fef9ee;color:#d97706}
          .pri-low{background:#f3f4f6;color:#6b7280}
          .freq{color:#6b7280;font-size:12px}
          .date{color:#9ca3af;font-size:12px}
          footer{text-align:center;padding:32px;color:#9ca3af;font-size:12px}
        </style>
      </head>
      <body>
        <header>
          <div class="logo">PP</div>
          <div>
            <h1>Marketing By Prince — Sitemap</h1>
            <p>XML Sitemap for search engines</p>
          </div>
        </header>
        <div class="container">
          <div class="stats">
            <div class="stat">
              <div class="stat-num"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
              <div class="stat-label">Total URLs</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Priority</th>
                <th>Change Freq</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <xsl:sort select="sitemap:priority" order="descending" data-type="number"/>
                <tr>
                  <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                  <td>
                    <xsl:variable name="p" select="sitemap:priority"/>
                    <xsl:choose>
                      <xsl:when test="$p >= 0.8"><span class="pri pri-high"><xsl:value-of select="$p"/></span></xsl:when>
                      <xsl:when test="$p >= 0.5"><span class="pri pri-med"><xsl:value-of select="$p"/></span></xsl:when>
                      <xsl:otherwise><span class="pri pri-low"><xsl:value-of select="$p"/></span></xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td class="freq"><xsl:value-of select="sitemap:changefreq"/></td>
                  <td class="date"><xsl:value-of select="substring(sitemap:lastmod,1,10)"/></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
        <footer>This sitemap is auto-generated. Submit /sitemap.xml to Google Search Console.</footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`

export async function GET() {
  return new NextResponse(XSL, {
    headers: {
      'Content-Type': 'application/xslt+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
