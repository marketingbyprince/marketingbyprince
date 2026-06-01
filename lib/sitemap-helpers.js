import { NextResponse } from 'next/server'

export function buildUrlset(pages) {
  if (!pages || pages.length === 0) return null   // caller should 404 on null

  const entries = pages.map(p => `  <url>
    <loc>${escapeXml(p.url)}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildHtmlUrlset(pages, title, backUrl) {
  const rows = [...pages]
    .sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority))
    .map(p => {
      const pr = parseFloat(p.priority || 0)
      const cls = pr >= 0.8 ? 'pri-high' : pr >= 0.5 ? 'pri-med' : 'pri-low'
      return `<tr>
        <td><a href="${p.url}" target="_blank" rel="noopener">${p.url}</a></td>
        <td><span class="pri ${cls}">${p.priority}</span></td>
        <td class="freq">${p.freq}</td>
        <td class="date">${p.lastmod || '—'}</td>
      </tr>`
    }).join('')

  const highCount = pages.filter(p => parseFloat(p.priority || 0) >= 0.8).length

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title} — Marketing By Prince</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;color:#111827}
    header{background:#111827;padding:20px 32px;display:flex;align-items:center;gap:14px}
    .logo{width:36px;height:36px;background:#ff6933;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:13px}
    header h1{color:#fff;font-size:18px;font-weight:700}
    header p{color:#9ca3af;font-size:12px;margin-top:2px}
    .container{max-width:1000px;margin:32px auto;padding:0 24px}
    .back{display:inline-flex;align-items:center;gap:6px;color:#ff6933;font-size:13px;font-weight:600;text-decoration:none;margin-bottom:20px;padding:7px 14px;background:#fff;border:1px solid #e5e7eb;border-radius:8px}
    .back:hover{border-color:#ff6933}
    .stats{display:flex;gap:12px;margin-bottom:20px}
    .stat{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 24px}
    .stat-num{font-size:26px;font-weight:800;color:#ff6933}
    .stat-label{font-size:11px;color:#6b7280;margin-top:2px}
    table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;font-size:13px}
    thead tr{background:#111827}
    th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em}
    td{padding:11px 14px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:#fafafa}
    a{color:#ff6933;text-decoration:none;word-break:break-all;font-size:12px}
    a:hover{text-decoration:underline}
    .pri{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700}
    .pri-high{background:#fef3ee;color:#ff6933}
    .pri-med{background:#fef9ee;color:#d97706}
    .pri-low{background:#f3f4f6;color:#6b7280}
    .freq{color:#6b7280;font-size:12px}
    .date{color:#9ca3af;font-size:12px;white-space:nowrap}
    .empty{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;text-align:center;color:#9ca3af}
    footer{text-align:center;padding:28px;color:#9ca3af;font-size:12px}
  </style>
</head>
<body>
  <header>
    <div class="logo">PP</div>
    <div>
      <h1>Marketing By Prince — Sitemap</h1>
      <p>${title}</p>
    </div>
  </header>
  <div class="container">
    <a class="back" href="${backUrl}">← Back to Sitemap Index</a>
    <div class="stats">
      <div class="stat">
        <div class="stat-num">${pages.length}</div>
        <div class="stat-label">Total URLs</div>
      </div>
      <div class="stat">
        <div class="stat-num">${highCount}</div>
        <div class="stat-label">High Priority</div>
      </div>
    </div>
    ${pages.length === 0
      ? `<div class="empty">No URLs found in this sitemap yet.</div>`
      : `<table>
          <thead><tr><th>URL</th><th>Priority</th><th>Change Freq</th><th>Last Modified</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`
    }
  </div>
  <footer>Auto-generated sitemap · Submit /sitemap.xml to Google Search Console</footer>
</body>
</html>`
}

// Googlebot, Bingbot etc. send text/html in Accept too — use UA to detect real bots
export function isBrowserRequest(request) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase()
  const botKeywords = ['googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot', 'facebookexternalhit', 'curl', 'wget', 'python', 'go-http']
  if (botKeywords.some(k => ua.includes(k))) return false
  return (request.headers.get('accept') || '').includes('text/html')
}

export function xmlResponse(xml) {
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}

export function notFoundXmlResponse() {
  return new NextResponse(null, { status: 404 })
}

export function htmlResponse(html) {
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
