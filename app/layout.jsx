import './globals.css'
import { cache } from 'react'
import { Raleway } from 'next/font/google'
import { supabase } from '@/lib/supabase'
import { SITE_URL } from '@/lib/site'
import SchemaScript from '@/components/SchemaScript'

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
const DEFAULT_DESCRIPTION = 'Performance marketing consultant managing $12K+/mo in ad spend across Google, Meta, LinkedIn and TikTok. 40+ client accounts, up to 10x ROAS, 3.5 years agency-side PPC.'
const DEFAULT_OG_IMAGE = '/og-image.jpg'

export async function generateMetadata() {
  const settings = await getGlobalSeoSettings()

  const siteName = settings?.site_name || 'Marketing By Prince'
  const title = settings?.default_title_suffix ? `${DEFAULT_TITLE}` : DEFAULT_TITLE
  const description = settings?.default_description || DEFAULT_DESCRIPTION
  const ogImage = settings?.default_og_image || DEFAULT_OG_IMAGE
  const twitterHandle = settings?.twitter_handle

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s${settings?.default_title_suffix || ' | Marketing By Prince'}`,
    },
    description,
    keywords: ['performance marketing', 'performance marketing consultant', 'PPC consultant India', 'Google Ads consultant', 'Meta Ads expert', 'LinkedIn Ads management', 'TikTok Ads management', 'Prince Pandey'],
    authors: [{ name: 'Prince Pandey', url: `${SITE_URL}/about` }],
    creator: 'Prince Pandey',
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: SITE_URL,
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
      canonical: SITE_URL,
    },
    ...(settings?.google_verification ? { verification: { google: settings.google_verification } } : {}),
  }
}

export default async function RootLayout({ children }) {
  const settings = await getGlobalSeoSettings()
  // Site-wide schema is opt-in via the SEO Center's Global Settings org_schema
  // field. Pages that need their own Person/Organization/BreadcrumbList graph
  // (e.g. /about) build and render it themselves, so this stays empty by
  // default rather than emitting a schema that duplicates or conflicts with it.
  const orgSchema = settings?.org_schema && Object.keys(settings.org_schema).length
    ? settings.org_schema
    : null

  return (
    <html lang="en" className={raleway.variable}>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T6C9JHXR');`,
          }}
        />
        {/* End Google Tag Manager */}
        <SchemaScript schemas={orgSchema} />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T6C9JHXR"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
      </body>
    </html>
  )
}
