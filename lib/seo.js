import { supabase } from '@/lib/supabase'

const SITE_URL = 'https://marketingbyprince.com'

async function fetchMetaRow(contentType, contentId) {
  let query = supabase.from('seo_page_meta').select('*').eq('content_type', contentType)
  query = contentId === null ? query.is('content_id', null) : query.eq('content_id', contentId)
  const { data } = await query.single()
  return data
}

async function fetchGlobalSettings() {
  const { data } = await supabase.from('seo_global_settings').select('*').limit(1).single()
  return data
}

// Builds a Next.js Metadata object for a page, sourced from the SEO Center
// (seo_page_meta + seo_global_settings), falling back to the caller-supplied
// defaults for every field so pages behave exactly as before if nobody has
// touched the SEO Center yet.
//
// fallback: { title, description, path } — path e.g. '/services/foo'
export async function getSeoMeta({ contentType, contentId = null, fallback }) {
  const [meta, globalSettings] = await Promise.all([
    fetchMetaRow(contentType, contentId),
    fetchGlobalSettings(),
  ])

  const title = meta?.meta_title || fallback.title
  const description = meta?.meta_description || fallback.description || globalSettings?.default_description || undefined
  const canonical = meta?.canonical_url || `${SITE_URL}${fallback.path}`
  const ogImage = meta?.og_image || globalSettings?.default_og_image

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: meta?.is_indexed !== false,
      follow: meta?.is_followed !== false,
    },
    openGraph: {
      title: meta?.og_title || title,
      description: meta?.og_description || description,
      url: canonical,
      type: meta?.og_type || 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: meta?.twitter_card || 'summary_large_image',
      title: meta?.twitter_title || title,
      description: meta?.twitter_description || description,
      ...((meta?.twitter_image || ogImage) ? { images: [meta?.twitter_image || ogImage] } : {}),
    },
  }
}

// Returns the JSON-LD schema objects an admin has configured for a page via
// SchemaBuilder, plus its AEO FAQ schema if present. Empty array if none.
export async function getSeoSchemas({ contentType, contentId = null }) {
  const meta = await fetchMetaRow(contentType, contentId)
  const schemas = []
  if (Array.isArray(meta?.schemas)) schemas.push(...meta.schemas.filter(Boolean))
  if (meta?.aeo_faq_schema && Object.keys(meta.aeo_faq_schema).length) schemas.push(meta.aeo_faq_schema)
  return schemas
}

// items: [{ name, url }] in order from Home to the current page.
export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
