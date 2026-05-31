import BlogPostClient from './BlogPostClient'

export async function generateMetadata({ params }) {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: post } = await supabase
      .from('articles')
      .select('title, excerpt, slug')
      .eq('slug', params.slug)
      .single()
    return {
      title: `${post?.title || 'Blog Post'} | Marketing By Prince`,
      description: post?.excerpt?.slice(0, 160),
      alternates: { canonical: `https://marketingbyprince.com/blog/${params.slug}` },
    }
  } catch {
    return { title: 'Blog Post | Marketing By Prince' }
  }
}

export default function Page({ params }) {
  return <BlogPostClient params={params} />
}
