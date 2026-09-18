import BlogClient from './BlogClient'
import { supabase } from '@/lib/supabase'
import { getSeoMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

async function getArticles() {
  const { data } = await supabase.from('articles')
    .select('id, title, slug, excerpt, cover_image_url, category, read_time_minutes, published_at')
    .eq('is_published', true).order('published_at', { ascending: false })
  return data || []
}

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'blogs',
    fallback: {
      title: 'Digital Marketing Blog | Performance Marketing Insights',
      description: 'Expert insights on PPC, Meta Ads, SEO, CRO and performance marketing strategies by Prince Pandey.',
      path: '/blog',
    },
  })
}

export default async function Page() {
  const articles = await getArticles()
  return <BlogClient initialArticles={articles} />
}
