import { xmlResponse, buildUrlset } from '@/lib/sitemap-helpers'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const today = new Date().toISOString().slice(0, 10)

  const pages = [{ url: `${baseUrl}/blog`, lastmod: today, freq: 'weekly', priority: '0.8' }]

  try {
    const { supabaseAdmin } = await import('@/lib/supabase')

    // Fetch all published articles, including those without slugs (for debug)
    const { data: posts, error } = await supabaseAdmin
      .from('articles')
      .select('slug, updated_at, is_published')
      .eq('is_published', true)

    if (error) {
      console.error('[blog-sitemap] Supabase error:', error)
    } else {
      console.log('[blog-sitemap] Total published articles:', posts?.length, 'Posts:', JSON.stringify(posts))
    }

    ;(posts || [])
      .filter(p => p.slug)
      .forEach(p => pages.push({
        url: `${baseUrl}/blog/${p.slug}`,
        lastmod: p.updated_at ? p.updated_at.slice(0, 10) : today,
        freq: 'weekly', priority: '0.7',
      }))
  } catch (err) {
    console.error('[blog-sitemap] Unexpected error:', err)
  }

  console.log('[blog-sitemap] Final pages:', pages.length)
  return xmlResponse(buildUrlset(pages))
}
