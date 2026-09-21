/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'marketingbyprince.com' },
      { protocol: 'https', hostname: 'www.marketingbyprince.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/gigs', destination: '/pricing', permanent: true },
      { source: '/gigs/:slug', destination: '/pricing/:slug', permanent: true },
      { source: '/portfolio', destination: '/work', permanent: true },
      { source: '/portfolio/:slug', destination: '/work', permanent: true },
      {
        source: '/services',
        has: [{ type: 'query', key: 'pillar' }],
        destination: '/services',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
