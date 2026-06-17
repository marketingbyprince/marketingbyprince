import { xmlResponse, buildUrlset } from '@/lib/sitemap-helpers'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)

  const pages = [{ url: `${baseUrl}/blog`, lastmod: today, freq: 'weekly', priority: '0.8' }]

  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { data: posts } = await supabaseAdmin
      .from('articles').select('slug, updated_at')
      .eq('is_published', true).not('slug', 'is', null)

    ;(posts || []).forEach(p => pages.push({
      url: `${baseUrl}/blog/${p.slug}`,
      lastmod: p.updated_at ? p.updated_at.slice(0, 10) : today,
      freq: 'weekly', priority: '0.7',
    }))
  } catch { /* fallback: just /blog */ }

  return xmlResponse(buildUrlset(pages))
}
