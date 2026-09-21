import { xmlResponse, buildUrlset } from '@/lib/sitemap-helpers'
import { SITE_URL } from '@/lib/site'

export async function GET() {
  const baseUrl = SITE_URL
  const today = new Date().toISOString().slice(0, 10)

  const pages = [{ url: `${baseUrl}/blog`, lastmod: today, freq: 'weekly', priority: '0.8' }]

  try {
    const { supabaseAdmin } = await import('@/lib/supabase')

    // articles has no updated_at column — published_at (falling back to
    // created_at) is the closest meaningful "last relevant date" it has.
    const { data: posts, error } = await supabaseAdmin
      .from('articles')
      .select('slug, published_at, created_at, is_published')
      .eq('is_published', true)

    if (error) {
      console.error('[blog-sitemap] Supabase error:', error)
    }

    ;(posts || [])
      .filter(p => p.slug)
      .forEach(p => pages.push({
        url: `${baseUrl}/blog/${p.slug}`,
        lastmod: (p.published_at || p.created_at) ? (p.published_at || p.created_at).slice(0, 10) : today,
        freq: 'weekly', priority: '0.7',
      }))
  } catch (err) {
    console.error('[blog-sitemap] Unexpected error:', err)
  }

  return xmlResponse(buildUrlset(pages))
}
