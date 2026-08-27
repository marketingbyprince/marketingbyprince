import { xmlResponse, buildUrlset } from '@/lib/sitemap-helpers'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)

  const pages = [
    { url: baseUrl,                     freq: 'weekly',  priority: '1.0', lastmod: today },
    { url: `${baseUrl}/about`,          freq: 'monthly', priority: '0.9', lastmod: today },
    { url: `${baseUrl}/services`,       freq: 'weekly',  priority: '0.9', lastmod: today },
    { url: `${baseUrl}/blog`,           freq: 'daily',   priority: '0.8', lastmod: today },
    { url: `${baseUrl}/pricing`,        freq: 'weekly',  priority: '0.8', lastmod: today },
    { url: `${baseUrl}/case-studies`,   freq: 'monthly', priority: '0.7', lastmod: today },
    { url: `${baseUrl}/certifications`, freq: 'monthly', priority: '0.6', lastmod: today },
    { url: `${baseUrl}/expertise`,      freq: 'monthly', priority: '0.6', lastmod: today },
    { url: `${baseUrl}/contact`,        freq: 'monthly', priority: '0.7', lastmod: today },
    { url: `${baseUrl}/author`,         freq: 'monthly', priority: '0.6', lastmod: today },
  ]

  // Page-builder pages (Privacy, Terms, Careers, Guides, FAQs, ...) — only
  // once an admin actually publishes them. Skip 'home' since '/' is already
  // listed above.
  try {
    const { data: builderPages } = await supabase
      .from('pages').select('slug, updated_at').eq('status', 'published')

    ;(builderPages || [])
      .filter(p => p.slug !== 'home')
      .forEach(p => pages.push({
        url: `${baseUrl}/${p.slug}`,
        lastmod: p.updated_at ? p.updated_at.slice(0, 10) : today,
        freq: 'monthly',
        priority: '0.5',
      }))
  } catch { /* fall back to the static list above */ }

  return xmlResponse(buildUrlset(pages))
}
