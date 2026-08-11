import './globals.css'
import { cache } from 'react'
import { Raleway } from 'next/font/google'
import Script from 'next/script'
import { supabase } from '@/lib/supabase'
import SchemaScript from '@/components/SchemaScript'

const GTM_ID = 'GTM-PCCX7QD2'
const GA_MEASUREMENT_ID = 'G-761G1ESBQT'

const getGlobalSeoSettings = cache(async () => {
  const { data } = await supabase.from('seo_global_settings').select('*').limit(1).single()
  return data
})

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-raleway',
  display: 'swap',
})

const DEFAULT_TITLE = 'Performance Marketing Consultant in India | Prince Pandey'
const DEFAULT_DESCRIPTION = 'Performance marketing first — backed by SEO, marketplace growth, web & app development, and automation. A complete digital growth partner for brands ready to scale. 3+ years, 40+ clients, consistent 3-5x ROAS.'
const DEFAULT_OG_IMAGE = '/og-image.jpg'

const defaultPersonSchema = {
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
      description: 'Full-service digital growth partner led by performance marketing — backed by SEO, marketplace growth, website & app development, creative, and marketing automation.',
    },
  ],
}

export async function generateMetadata() {
  const settings = await getGlobalSeoSettings()

  const siteName = settings?.site_name || 'Marketing By Prince'
  const title = settings?.default_title_suffix ? `${DEFAULT_TITLE}` : DEFAULT_TITLE
  const description = settings?.default_description || DEFAULT_DESCRIPTION
  const ogImage = settings?.default_og_image || DEFAULT_OG_IMAGE
  const twitterHandle = settings?.twitter_handle

  return {
    metadataBase: new URL('https://marketingbyprince.com'),
    title: {
      default: title,
      template: `%s${settings?.default_title_suffix || ' | Marketing By Prince'}`,
    },
    description,
    keywords: ['performance marketing', 'digital growth partner', 'PPC consultant India', 'Meta Ads expert', 'SEO services India', 'marketplace growth', 'marketing automation', 'Google Ads consultant', 'Prince Pandey'],
    authors: [{ name: 'Prince Pandey', url: 'https://marketingbyprince.com/about' }],
    creator: 'Prince Pandey',
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: 'https://marketingbyprince.com',
      siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      ...(twitterHandle ? { site: twitterHandle, creator: twitterHandle } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    alternates: {
      canonical: 'https://marketingbyprince.com',
    },
    ...(settings?.google_verification ? { verification: { google: settings.google_verification } } : {}),
  }
}

export default async function RootLayout({ children }) {
  const settings = await getGlobalSeoSettings()
  const orgSchema = settings?.org_schema && Object.keys(settings.org_schema).length
    ? settings.org_schema
    : defaultPersonSchema

  return (
    <html lang="en" className={raleway.variable}>
      <head>
        <SchemaScript schemas={orgSchema} />

        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>

        {/* Google tag (gtag.js) */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
    </html>
  )
}
