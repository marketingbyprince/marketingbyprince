import { NextResponse } from 'next/server'

const XSL = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <title>Sitemap — Marketing By Prince</title>
        <style>
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;color:#111827}
          header{background:#111827;padding:20px 32px;display:flex;align-items:center;gap:14px}
          .logo{width:36px;height:36px;background:#ff6933;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:13px;flex-shrink:0}
          header h1{color:#fff;font-size:18px;font-weight:700}
          header p{color:#9ca3af;font-size:12px;margin-top:2px}
          .container{max-width:1000px;margin:32px auto;padding:0 24px}
          .stats{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}
          .stat{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 22px}
          .stat-num{font-size:26px;font-weight:800;color:#ff6933}
          .stat-label{font-size:11px;color:#6b7280;margin-top:2px}
          .hint{background:#fff3ee;border:1px solid #fed7aa;border-radius:10px;padding:12px 16px;margin-bottom:24px;font-size:13px;color:#92400e}
          .hint code{background:#fde68a;padding:1px 5px;border-radius:4px;font-size:12px}

          /* Index cards */
          .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
          .card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px 22px;text-decoration:none;display:flex;align-items:center;justify-content:space-between;transition:box-shadow .15s,border-color .15s}
          .card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);border-color:#ff6933}
          .card-left{}
          .card-name{font-size:15px;font-weight:700;color:#111827;margin-bottom:4px}
          .card-url{font-size:11px;color:#9ca3af;word-break:break-all}
          .card-arrow{font-size:20px;color:#ff6933;flex-shrink:0;margin-left:12px}

          /* URL table */
          .back{display:inline-flex;align-items:center;gap:6px;color:#ff6933;font-size:13px;font-weight:600;text-decoration:none;margin-bottom:20px}
          .back:hover{text-decoration:underline}
          table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;font-size:13px}
          thead tr{background:#111827}
          th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em}
          td{padding:11px 14px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
          tr:last-child td{border-bottom:none}
          tr:hover td{background:#fafafa}
          a{color:#ff6933;text-decoration:none;word-break:break-all}
          a:hover{text-decoration:underline}
          .pri{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700}
          .pri-high{background:#fef3ee;color:#ff6933}
          .pri-med{background:#fef9ee;color:#d97706}
          .pri-low{background:#f3f4f6;color:#6b7280}
          .freq{color:#6b7280;font-size:12px}
          .date{color:#9ca3af;font-size:12px;white-space:nowrap}
          footer{text-align:center;padding:28px;color:#9ca3af;font-size:12px}
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

          <!-- SITEMAP INDEX: show clickable cards -->
          <xsl:if test="sm:sitemapindex">
            <div class="stats">
              <div class="stat">
                <div class="stat-num"><xsl:value-of select="count(sm:sitemapindex/sm:sitemap)"/></div>
                <div class="stat-label">Sitemaps</div>
              </div>
            </div>
            <div class="hint">
              📌 Submit <code>/sitemap.xml</code> to Google Search Console. Click a sitemap below to explore its URLs.
            </div>
            <div class="cards">
              <xsl:for-each select="sm:sitemapindex/sm:sitemap">
                <a class="card" href="{sm:loc}">
                  <div class="card-left">
                    <div class="card-name">
                      <xsl:choose>
                        <xsl:when test="contains(sm:loc,'pages-sitemap')">📄 Pages</xsl:when>
                        <xsl:when test="contains(sm:loc,'gigs-sitemap')">💼 Gigs</xsl:when>
                        <xsl:when test="contains(sm:loc,'services-sitemap')">🛠 Services</xsl:when>
                        <xsl:when test="contains(sm:loc,'blog-sitemap')">✍️ Blog</xsl:when>
                        <xsl:when test="contains(sm:loc,'case-studies-sitemap')">📊 Case Studies</xsl:when>
                        <xsl:otherwise>🗂 Sitemap</xsl:otherwise>
                      </xsl:choose>
                    </div>
                    <div class="card-url"><xsl:value-of select="sm:loc"/></div>
                    <div class="card-url" style="margin-top:3px;color:#d1d5db">Last updated: <xsl:value-of select="substring(sm:lastmod,1,10)"/></div>
                  </div>
                  <div class="card-arrow">→</div>
                </a>
              </xsl:for-each>
            </div>
          </xsl:if>

          <!-- URLSET: show URL table -->
          <xsl:if test="sm:urlset">
            <a class="back" href="/sitemap.xml">← Back to Sitemap Index</a>
            <div class="stats" style="margin-bottom:20px">
              <div class="stat">
                <div class="stat-num"><xsl:value-of select="count(sm:urlset/sm:url)"/></div>
                <div class="stat-label">Total URLs</div>
              </div>
              <div class="stat">
                <div class="stat-num"><xsl:value-of select="count(sm:urlset/sm:url[sm:priority >= 0.8])"/></div>
                <div class="stat-label">High Priority</div>
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
                <xsl:for-each select="sm:urlset/sm:url">
                  <xsl:sort select="sm:priority" order="descending" data-type="number"/>
                  <tr>
                    <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
                    <td>
                      <xsl:variable name="p" select="sm:priority"/>
                      <xsl:choose>
                        <xsl:when test="$p >= 0.8"><span class="pri pri-high"><xsl:value-of select="$p"/></span></xsl:when>
                        <xsl:when test="$p >= 0.5"><span class="pri pri-med"><xsl:value-of select="$p"/></span></xsl:when>
                        <xsl:otherwise><span class="pri pri-low"><xsl:value-of select="$p"/></span></xsl:otherwise>
                      </xsl:choose>
                    </td>
                    <td class="freq"><xsl:value-of select="sm:changefreq"/></td>
                    <td class="date"><xsl:value-of select="substring(sm:lastmod,1,10)"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>

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
