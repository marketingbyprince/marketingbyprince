import './globals.css'
import { Raleway } from 'next/font/google'

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://marketingbyprince.com'),
  title: {
    default: 'Performance Marketing Consultant in India | Prince Pandey',
    template: '%s | Marketing By Prince',
  },
  description: 'Performance marketing, SEO, PPC, Meta Ads and growth marketing services by Prince Pandey. 3+ years, 40+ clients, consistent 3-5x ROAS.',
  keywords: ['performance marketing', 'PPC consultant India', 'Meta Ads expert', 'SEO services India', 'Google Ads consultant', 'Prince Pandey'],
  authors: [{ name: 'Prince Pandey', url: 'https://marketingbyprince.com/about' }],
  creator: 'Prince Pandey',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://marketingbyprince.com',
    siteName: 'Marketing By Prince',
    title: 'Performance Marketing Consultant in India | Prince Pandey',
    description: 'PPC, Meta Ads, SEO & growth marketing by Prince Pandey.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Marketing By Prince' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketing By Prince | Prince Pandey',
    description: 'PPC, Meta Ads, SEO & growth marketing consultant.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: 'https://marketingbyprince.com',
  },
}

const personSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://marketingbyprince.com/#person',
      name: 'Prince Pandey',
      jobTitle: 'Performance Marketing Consultant',
      url: 'https://marketingbyprince.com',
      email: 'marketingbyprince@gmail.com',
      telephone: '+919465992412',
      address: { '@type': 'PostalAddress', addressLocality: 'Panchkula', addressRegion: 'Haryana', addressCountry: 'IN' },
      sameAs: ['https://linkedin.com/in/prince-pandey', 'https://github.com/prince-pandey'],
      knowsAbout: ['PPC', 'Meta Ads', 'Google Ads', 'SEO', 'Performance Marketing', 'CRO'],
    },
    {
      '@type': 'Organization',
      '@id': 'https://marketingbyprince.com/#organization',
      name: 'Marketing By Prince',
      url: 'https://marketingbyprince.com',
      founder: { '@id': 'https://marketingbyprince.com/#person' },
      description: 'Digital marketing agency specializing in PPC, Meta Ads, SEO and growth marketing.',
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={raleway.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
