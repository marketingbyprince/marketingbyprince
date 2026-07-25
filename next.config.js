/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/gigs', destination: '/pricing', permanent: true },
      { source: '/gigs/:slug', destination: '/pricing/:slug', permanent: true },
    ]
  },
}

module.exports = nextConfig
