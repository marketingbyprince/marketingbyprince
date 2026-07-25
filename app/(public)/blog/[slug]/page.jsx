import BlogPostClient from './BlogPostClient'
import SchemaScript from '@/components/SchemaScript'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema } from '@/lib/seo'

async function getArticle(slug) {
  const { data } = await supabase.from('articles')
    .select('title, excerpt, slug, cover_image_url, published_at, created_at, author')
    .eq('slug', slug).single()
  return data
}

export async function generateMetadata({ params }) {
  const post = await getArticle(params.slug)
  return getSeoMeta({
    contentType: 'blog_post',
    contentId: params.slug,
    fallback: {
      title: `${post?.title || 'Blog Post'} | Marketing By Prince`,
      description: post?.excerpt?.slice(0, 160),
      path: `/blog/${params.slug}`,
    },
  })
}

export default async function Page({ params }) {
  const post = await getArticle(params.slug)
  const schemas = await getSeoSchemas({ contentType: 'blog_post', contentId: params.slug })

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://marketingbyprince.com' },
    { name: 'Insights', url: 'https://marketingbyprince.com/blog' },
    { name: post?.title || 'Blog Post', url: `https://marketingbyprince.com/blog/${params.slug}` },
  ])

  const articleSchema = post ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    datePublished: post.published_at || post.created_at,
    author: { '@type': 'Person', name: post.author || 'Prince Pandey' },
  } : null

  return (
    <>
      <SchemaScript schemas={[breadcrumb, articleSchema, ...schemas]} />
      <BlogPostClient params={params} />
    </>
  )
}
