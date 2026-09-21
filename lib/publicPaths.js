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
  gigs: ['/pricing'],
  gig: [{ path: '/pricing/[slug]', type: 'page' }, '/pricing'],
  case_studies: ['/case-studies'],
  case_study: [{ path: '/case-studies/[slug]', type: 'page' }, '/case-studies'],
  blogs: ['/blog'],
  blog_post: [{ path: '/blog/[slug]', type: 'page' }, '/blog'],
}
