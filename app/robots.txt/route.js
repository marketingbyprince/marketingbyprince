import { supabase } from '@/lib/supabase'

function defaultRobotsTxt(baseUrl) {
  return `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${baseUrl}/sitemap.xml\n`
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.vercel.app'
  const { data } = await supabase.from('seo_global_settings').select('robots_txt').limit(1).single()

  const body = data?.robots_txt?.trim() ? data.robots_txt : defaultRobotsTxt(baseUrl)

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
