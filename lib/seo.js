import { supabase } from '@/lib/supabase'
import { SITE_URL } from '@/lib/site'

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
// fallback: { title, description, path, ogImageWidth, ogImageHeight, ogImageAlt }
// path e.g. '/services/foo'. The og image dimensions/alt are attached
// whenever an og image is present, since seo_page_meta has no columns for
// them, they only describe the fallback image the caller knows about.
export async function getSeoMeta({ contentType, contentId = null, fallback }) {
  const [meta, globalSettings] = await Promise.all([
    fetchMetaRow(contentType, contentId),
    fetchGlobalSettings(),
  ])

  const title = meta?.meta_title || fallback.title
  const description = meta?.meta_description || fallback.description || globalSettings?.default_description || undefined
  const canonical = meta?.canonical_url || `${SITE_URL}${fallback.path}`
  const ogImage = meta?.og_image || globalSettings?.default_og_image
  const ogImageExtra = {
    ...(fallback.ogImageWidth ? { width: fallback.ogImageWidth } : {}),
    ...(fallback.ogImageHeight ? { height: fallback.ogImageHeight } : {}),
    ...(fallback.ogImageAlt ? { alt: fallback.ogImageAlt } : {}),
  }

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
      ...(ogImage ? { images: [{ url: ogImage, ...ogImageExtra }] } : {}),
    },
    twitter: {
      card: meta?.twitter_card || 'summary_large_image',
      title: meta?.twitter_title || title,
      description: meta?.twitter_description || description,
      ...((meta?.twitter_image || ogImage) ? { images: [{ url: meta?.twitter_image || ogImage, ...ogImageExtra }] } : {}),
    },
  }
}

// Keeps only entries with a non-empty question and answer, trimmed. The one
// filter both getPageFaqs() (visible <FaqSection>) and getSeoSchemas() (the
// FAQPage JSON-LD) run over seo_page_meta.aeo_faq_schema, so the rendered
// text and the structured data are always built from the same list.
function cleanFaqEntries(entries) {
  if (!Array.isArray(entries)) return []
  return entries
    .filter(e => e?.q?.trim() && e?.a?.trim())
    .map(e => ({ question: e.q.trim(), answer: e.a.trim() }))
}

// The cleaned FAQ list for a page, sourced from the SEO Center's AEO tab
// ("FAQ Schema Entries" field, seo_page_meta.aeo_faq_schema). Used by
// <FaqSection> to render the visible Q&A. The AI Overview FAQ field
// (ai_faq) is a separate field and is never used here.
export async function getPageFaqs(contentType, contentId = null) {
  const meta = await fetchMetaRow(contentType, contentId)
  return cleanFaqEntries(meta?.aeo_faq_schema)
}

// Builds a single JSON-LD @graph for a page: the admin's SchemaBuilder blocks
// (SEO Center > Schema tab) plus a proper FAQPage node built from the AEO
// FAQ entries, plus any extra nodes the caller passes in (e.g. a
// BreadcrumbList or ProfilePage built for that specific route). Returns null
// if there's nothing to render, so <SchemaScript> emits no <script> tag.
//
// Every node's own "@context" is stripped since @graph nodes share the one
// top-level "@context" — keeping per-node ones would still validate, but a
// single shared context is the clean/canonical way to combine multiple types.
export async function getSeoSchemas({ contentType, contentId = null, extraNodes = [] }) {
  const meta = await fetchMetaRow(contentType, contentId)
  const nodes = []

  if (Array.isArray(meta?.schemas)) {
    for (const s of meta.schemas.filter(Boolean)) {
      const { '@context': _context, ...node } = s
      nodes.push(node)
    }
  }

  const faqs = cleanFaqEntries(meta?.aeo_faq_schema)
  if (faqs.length) {
    nodes.push(buildFaqPageSchema(faqs.map(f => ({ q: f.question, a: f.answer })), {
      id: meta.canonical_url ? `${meta.canonical_url}#faq` : undefined,
    }))
  }

  nodes.push(...extraNodes.filter(Boolean))

  if (!nodes.length) return null
  return { '@context': 'https://schema.org', '@graph': nodes }
}

// entries: [{ q, a }, ...] from the SEO Center's AEO FAQ editor.
export function buildFaqPageSchema(entries, { id } = {}) {
  return {
    ...(id ? { '@id': id } : {}),
    '@type': 'FAQPage',
    mainEntity: entries
      .filter(e => e?.q && e?.a)
      .map(e => ({
        '@type': 'Question',
        name: e.q,
        acceptedAnswer: { '@type': 'Answer', text: e.a },
      })),
  }
}

// A ProfilePage node for a person/bio page, cross-linked by @id to the
// Person, BreadcrumbList and primary image nodes already in the graph.
export function buildProfilePageSchema({ id, url, name, personId, breadcrumbId, primaryImageId }) {
  return {
    '@id': id,
    '@type': 'ProfilePage',
    url,
    name,
    mainEntity: { '@id': personId },
    ...(breadcrumbId ? { breadcrumb: { '@id': breadcrumbId } } : {}),
    ...(primaryImageId ? { primaryImageOfPage: { '@id': primaryImageId } } : {}),
  }
}

// A Service node for a service landing page, provided by Prince Pandey as a
// Person, serving the given countries.
export function buildServiceSchema({ id, name, description, url, areaServed = ['India', 'Australia', 'United Kingdom', 'United States'] }) {
  return {
    '@id': id,
    '@type': 'Service',
    name,
    description,
    url,
    provider: { '@type': 'Person', name: 'Prince Pandey', url: `${SITE_URL}/about` },
    areaServed: areaServed.map(name => ({ '@type': 'Country', name })),
  }
}

// items: [{ name, url }] in order from Home to the current page.
export function buildBreadcrumbSchema(items, { id } = {}) {
  return {
    ...(id ? { '@id': id } : {}),
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
