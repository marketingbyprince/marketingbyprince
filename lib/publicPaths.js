// Maps an admin content-type / table name to the public page(s) built from
// it, for cache revalidation after an admin save. A dynamic route is given
// as { path: '/services/[slug]', type: 'page' } so revalidatePath refreshes
// every page matching that pattern without resolving which slug changed.
export const PUBLIC_PATHS = {
  about: ['/about'],
  homepage: ['/'],
  contact: ['/contact'],
  certifications: ['/certifications'],
  expertise: ['/expertise'],
  services: ['/services'],
  service: [{ path: '/services/[slug]', type: 'page' }, '/services'],
  'performance-marketing-service': ['/services/performance-marketing'],
  'service-google-ads-management': ['/services/google-ads-management'],
  'service-tiktok-ads-management': ['/services/tiktok-ads-management'],
  'service-meta-ads-management': ['/services/meta-ads-management'],
  'service-linkedin-ads-management': ['/services/linkedin-ads-management'],
  'service-white-label-ppc': ['/services/white-label-ppc'],
  'service-ppc-audit': ['/services/ppc-audit'],
  'service-landing-page-cro': ['/services/landing-page-cro'],
  'service-tracking-attribution-analytics': ['/services/tracking-attribution-analytics'],
  gigs: ['/pricing'],
  gig: [{ path: '/pricing/[slug]', type: 'page' }, '/pricing'],
  case_studies: ['/case-studies'],
  case_study: [{ path: '/case-studies/[slug]', type: 'page' }, '/case-studies'],
  blogs: ['/blog'],
  blog_post: [{ path: '/blog/[slug]', type: 'page' }, '/blog'],
}
