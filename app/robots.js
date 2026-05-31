export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/admin/login'],
      },
    ],
    sitemap: 'https://marketingbyprince.com/sitemap.xml',
    host: 'https://marketingbyprince.com',
  }
}
