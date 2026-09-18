import AboutClient from './AboutClient'
import SchemaScript from '@/components/SchemaScript'
import { getSeoMeta, getSeoSchemas } from '@/lib/seo'

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'about',
    fallback: {
      title: 'About Prince Pandey | Performance Marketing Expert',
      description: '3+ years managing 40+ client accounts. Key Account Manager specializing in Google, Meta, LinkedIn & TikTok Ads.',
      path: '/about',
    },
  })
}

export default async function Page() {
  const schemas = await getSeoSchemas({ contentType: 'about' })
  return (
    <>
      <SchemaScript schemas={schemas} />
      <AboutClient />
    </>
  )
}
