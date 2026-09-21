// Single source of truth for the site's public, canonical base URL.
// Never fall back to VERCEL_URL here — it points at the deployment's
// *.vercel.app host, which must never leak into sitemaps, robots.txt,
// canonical tags, or structured data.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marketingbyprince.com'
