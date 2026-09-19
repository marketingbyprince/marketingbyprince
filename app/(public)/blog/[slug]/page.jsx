import BlogPostClient from './BlogPostClient'
import SchemaScript from '@/components/SchemaScript'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, buildBreadcrumbSchema } from '@/lib/seo'

async function getArticleDetail(slug) {
  const [{ data: article }, { data: authorProfile }] = await Promise.all([
    supabase.from('articles').select('*').eq('slug', slug).eq('is_published', true).single(),
    supabase.from('author_profile').select('*').eq('id', 1).single(),
  ])
  return { article: article || null, author: authorProfile || null }
}

export async function generateMetadata({ params }) {
  const { article: post } = await getArticleDetail(params.slug)
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
  const detail = await getArticleDetail(params.slug)
  const post = detail.article

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://marketingbyprince.com' },
    { name: 'Insights', url: 'https://marketingbyprince.com/blog' },
    { name: post?.title || 'Blog Post', url: `https://marketingbyprince.com/blog/${params.slug}` },
  ])

  const articleSchema = post ? {
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    datePublished: post.published_at || post.created_at,
    author: { '@type': 'Person', name: post.author || 'Prince Pandey' },
  } : null

  const graph = await getSeoSchemas({ contentType: 'blog_post', contentId: params.slug, extraNodes: [breadcrumb, articleSchema] })

  return (
    <>
      <SchemaScript schemas={graph} />
      <BlogPostClient initial={detail} />
    </>
  )
}
