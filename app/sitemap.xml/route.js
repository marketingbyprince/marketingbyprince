import { NextResponse } from 'next/server'

const BASE_URL = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'

// Raw XML index for Google/bots
function buildXmlIndex(baseUrl) {
  const today = new Date().toISOString().slice(0, 10)
  const sitemaps = ['pages', 'gigs', 'services', 'blog', 'case-studies']
  const entries = sitemaps.map(s => `  <sitemap>
    <loc>${baseUrl}/${s}-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`
}

// Styled HTML index for browsers
function buildHtmlIndex(baseUrl) {
  const today = new Date().toISOString().slice(0, 10)
  const sections = [
    { key: 'pages',        icon: '📄', label: 'Pages' },
    { key: 'gigs',         icon: '💼', label: 'Gigs' },
    { key: 'services',     icon: '🛠️', label: 'Services' },
    { key: 'blog',         icon: '✍️',  label: 'Blog' },
    { key: 'case-studies', icon: '📊', label: 'Case Studies' },
  ]

  const cards = sections.map(s => `
    <a class="card" href="${baseUrl}/${s.key}-sitemap.xml">
      <div class="card-icon">${s.icon}</div>
      <div class="card-body">
        <div class="card-name">${s.label}</div>
        <div class="card-url">${baseUrl}/${s.key}-sitemap.xml</div>
        <div class="card-date">Updated: ${today}</div>
      </div>
      <div class="card-arrow">→</div>
    </a>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Sitemap — Marketing By Prince</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;color:#111827}
    header{background:#111827;padding:20px 32px;display:flex;align-items:center;gap:14px}
    .logo{width:36px;height:36px;background:#ff6933;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:13px}
    header h1{color:#fff;font-size:18px;font-weight:700}
    header p{color:#9ca3af;font-size:12px;margin-top:2px}
    .container{max-width:860px;margin:36px auto;padding:0 24px}
    .stats{display:flex;gap:12px;margin-bottom:20px}
    .stat{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 24px}
    .stat-num{font-size:26px;font-weight:800;color:#ff6933}
    .stat-label{font-size:11px;color:#6b7280;margin-top:2px}
    .hint{background:#fff3ee;border:1px solid #fed7aa;border-radius:10px;padding:12px 16px;margin-bottom:28px;font-size:13px;color:#92400e}
    .hint code{background:#fde68a;padding:1px 6px;border-radius:4px;font-size:12px}
    .cards{display:flex;flex-direction:column;gap:12px}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px 22px;text-decoration:none;display:flex;align-items:center;gap:16px;transition:box-shadow .15s,border-color .15s}
    .card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);border-color:#ff6933}
    .card-icon{font-size:26px;flex-shrink:0}
    .card-body{flex:1;min-width:0}
    .card-name{font-size:15px;font-weight:700;color:#111827;margin-bottom:3px}
    .card-url{font-size:12px;color:#9ca3af;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .card-date{font-size:11px;color:#d1d5db;margin-top:2px}
    .card-arrow{font-size:18px;color:#ff6933;flex-shrink:0}
    footer{text-align:center;padding:32px;color:#9ca3af;font-size:12px}
  </style>
</head>
<body>
  <header>
    <div class="logo">PP</div>
    <div>
      <h1>Marketing By Prince — Sitemap</h1>
      <p>XML Sitemap Index for search engines</p>
    </div>
  </header>
  <div class="container">
    <div class="stats">
      <div class="stat">
        <div class="stat-num">${sections.length}</div>
        <div class="stat-label">Sitemaps</div>
      </div>
    </div>
    <div class="hint">
      📌 Submit <code>${baseUrl}/sitemap.xml</code> to Google Search Console. Click any sitemap below to view its URLs.
    </div>
    <div class="cards">${cards}</div>
  </div>
  <footer>Auto-generated sitemap index · Submit /sitemap.xml to Google Search Console</footer>
</body>
</html>`
}

export async function GET(request) {
  const baseUrl = BASE_URL()
  const { isBrowserRequest } = await import('@/lib/sitemap-helpers')
  const isBot = !isBrowserRequest(request)

  if (isBot) {
    return new NextResponse(buildXmlIndex(baseUrl), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  return new NextResponse(buildHtmlIndex(baseUrl), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
