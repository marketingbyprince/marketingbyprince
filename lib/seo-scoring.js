/**
 * SEO Health Score Engine
 * Returns scores 0-100 for each dimension + overall
 */
export function computeSeoScores(meta) {
  if (!meta) return emptyScores()

  const basic = scoreBasic(meta)
  const content = scoreContent(meta)
  const ai = scoreAi(meta)
  const aeo = scoreAeo(meta)
  const geo = scoreGeo(meta)
  const schema = scoreSchema(meta)
  const technical = scoreTechnical(meta)

  const overall = Math.round(
    basic * 0.25 +
    content * 0.15 +
    ai * 0.15 +
    aeo * 0.10 +
    geo * 0.10 +
    schema * 0.15 +
    technical * 0.10
  )

  return { overall, basic, content, ai, aeo, geo, schema, technical }
}

export function scoreLabel(score) {
  if (score >= 80) return 'Good'
  if (score >= 50) return 'Needs Work'
  return 'Poor'
}

export function scoreColor(score) {
  if (score >= 80) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export function scoreBg(score) {
  if (score >= 80) return '#f0fdf4'
  if (score >= 50) return '#fffbeb'
  return '#fef2f2'
}

function emptyScores() {
  return { overall: 0, basic: 0, content: 0, ai: 0, aeo: 0, geo: 0, schema: 0, technical: 0 }
}

function pct(earned, total) {
  return Math.round((earned / total) * 100)
}

function hasContent(v) {
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object' && v !== null) return Object.keys(v).length > 0
  return Boolean(v && String(v).trim())
}

function scoreBasic(m) {
  let pts = 0
  if (hasContent(m.meta_title)) pts += 20
  if (hasContent(m.meta_description)) pts += 15
  if (hasContent(m.canonical_url)) pts += 10
  if (hasContent(m.og_title)) pts += 10
  if (hasContent(m.og_description)) pts += 10
  if (hasContent(m.og_image)) pts += 15
  if (hasContent(m.twitter_title)) pts += 5
  if (hasContent(m.twitter_image)) pts += 5
  if (hasContent(m.slug)) pts += 10
  return pts
}

function scoreContent(m) {
  let pts = 0
  if (hasContent(m.focus_keyword)) pts += 30
  if (hasContent(m.secondary_keywords)) pts += 20
  if (hasContent(m.search_intent)) pts += 20
  if (hasContent(m.content_cluster)) pts += 15
  if (hasContent(m.internal_links)) pts += 15
  return pts
}

function scoreAi(m) {
  let pts = 0
  if (hasContent(m.ai_summary)) pts += 25
  if (hasContent(m.ai_key_takeaways)) pts += 20
  if (hasContent(m.ai_faq)) pts += 25
  if (hasContent(m.ai_expert_insights)) pts += 15
  if (hasContent(m.ai_stats)) pts += 10
  if (hasContent(m.ai_sources)) pts += 5
  return pts
}

function scoreAeo(m) {
  let pts = 0
  if (hasContent(m.aeo_questions)) pts += 25
  if (hasContent(m.aeo_featured_snippet)) pts += 25
  if (hasContent(m.aeo_short_answer)) pts += 25
  if (hasContent(m.aeo_faq_schema)) pts += 25
  return pts
}

function scoreGeo(m) {
  let pts = 0
  if (hasContent(m.geo_entities)) pts += 25
  if (hasContent(m.geo_brand_mentions)) pts += 20
  if (hasContent(m.geo_service_mentions)) pts += 20
  if (hasContent(m.geo_topical_authority)) pts += 20
  if (m.geo_semantic_score > 0) pts += 15
  return pts
}

function scoreSchema(m) {
  const schemas = Array.isArray(m.schemas) ? m.schemas : []
  if (schemas.length === 0) return 0
  const pts = Math.min(schemas.length * 25, 100)
  return pts
}

function scoreTechnical(m) {
  let pts = 0
  if (m.is_indexed !== false) pts += 30
  if (m.is_followed !== false) pts += 20
  if (m.has_canonical !== false) pts += 25
  if (m.in_sitemap !== false) pts += 25
  return pts
}
