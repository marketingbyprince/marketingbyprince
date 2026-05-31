import { supabase } from '@/lib/supabase'

export default async function sitemap() {
  const baseUrl = 'https://marketingbyprince.com'

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/gigs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/portfolio`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/certifications`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const { data: services } = await supabase.from('services').select('slug, updated_at')
  const servicePages = (services || []).map(s => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const { data: posts } = await supabase.from('articles').select('slug, updated_at').eq('published', true)
  const blogPages = (posts || []).map(p => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const { data: gigs } = await supabase.from('gigs').select('slug, updated_at').eq('is_active', true)
  const gigPages = (gigs || []).map(g => ({
    url: `${baseUrl}/gigs/${g.slug}`,
    lastModified: new Date(g.updated_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticPages, ...servicePages, ...blogPages, ...gigPages]
}
