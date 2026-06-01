import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.com'

  // Fetch the actual sitemap XML
  let urls = []
  try {
    const res = await fetch(`${baseUrl}/sitemap.xml`, { next: { revalidate: 0 } })
    const xml = await res.text()
    const matches = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    urls = matches.map(m => {
      const loc      = (m[1].match(/<loc>(.*?)<\/loc>/) || [])[1] || ''
      const lastmod  = (m[1].match(/<lastmod>(.*?)<\/lastmod>/) || [])[1] || ''
      const freq     = (m[1].match(/<changefreq>(.*?)<\/changefreq>/) || [])[1] || ''
      const priority = (m[1].match(/<priority>(.*?)<\/priority>/) || [])[1] || ''
      return { loc, lastmod, freq, priority }
    })
  } catch {
    urls = []
  }

  const rows = urls
    .sort((a, b) => parseFloat(b.priority || 0) - parseFloat(a.priority || 0))
    .map(u => {
      const p = parseFloat(u.priority || 0)
      const cls = p >= 0.8 ? 'pri-high' : p >= 0.5 ? 'pri-med' : 'pri-low'
      return `<tr>
        <td><a href="${u.loc}" target="_blank" rel="noopener">${u.loc}</a></td>
        <td><span class="pri ${cls}">${u.priority}</span></td>
        <td class="freq">${u.freq}</td>
        <td class="date">${u.lastmod ? u.lastmod.slice(0, 10) : '—'}</td>
      </tr>`
    }).join('')

  const html = `<!DOCTYPE html>
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
    .container{max-width:1050px;margin:32px auto;padding:0 20px}
    .stats{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}
    .stat{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 22px}
    .stat-num{font-size:26px;font-weight:800;color:#ff6933}
    .stat-label{font-size:11px;color:#6b7280;margin-top:2px}
    .hint{background:#fff3ee;border:1px solid #fed7aa;border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#92400e}
    .hint code{background:#fde68a;padding:1px 5px;border-radius:4px;font-size:12px}
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
    footer{text-align:center;padding:28px;color:#9ca3af;font-size:12px}
  </style>
</head>
<body>
  <header>
    <div class="logo">PP</div>
    <div>
      <h1>Marketing By Prince — Sitemap</h1>
      <p>Auto-generated XML sitemap for search engines</p>
    </div>
  </header>
  <div class="container">
    <div class="stats">
      <div class="stat">
        <div class="stat-num">${urls.length}</div>
        <div class="stat-label">Total URLs</div>
      </div>
      <div class="stat">
        <div class="stat-num">${urls.filter(u => parseFloat(u.priority||0) >= 0.8).length}</div>
        <div class="stat-label">High Priority</div>
      </div>
    </div>
    <div class="hint">
      📌 Submit <code>${baseUrl}/sitemap.xml</code> to Google Search Console (not this page).
      This is a human-readable view only.
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
      <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:32px">No URLs found — check Supabase env vars</td></tr>'}</tbody>
    </table>
  </div>
  <footer>Submit /sitemap.xml to Google Search Console · This page is for human review only</footer>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  })
}
