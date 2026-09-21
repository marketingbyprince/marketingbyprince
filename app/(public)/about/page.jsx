import AboutClient from './AboutClient'
import SchemaScript from '@/components/SchemaScript'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, buildProfilePageSchema } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const ABOUT_URL = 'https://marketingbyprince.com/about'

async function getAboutData() {
  const [{ data: about }, { data: experience }, { data: skills }, { data: education }] = await Promise.all([
    supabase.from('about_content').select('*').single(),
    supabase.from('work_experience').select('*').order('sort_order'),
    supabase.from('skills').select('*').order('category').order('sort_order'),
    supabase.from('education').select('*').order('sort_order'),
  ])
  return { about: about || null, experience: experience || [], skills: skills || [], education: education || [] }
}

export async function generateMetadata() {
  return getSeoMeta({
    contentType: 'about',
    fallback: {
      title: 'About Prince Pandey | Performance Marketing Expert',
      description: '3+ years managing 40+ client accounts. Key Account Manager specializing in Google, Meta, LinkedIn & TikTok Ads.',
      path: '/about',
      ogImageWidth: 1200,
      ogImageHeight: 630,
      ogImageAlt: 'Prince Pandey, Performance Marketer',
    },
  })
}

export default async function Page() {
  const [graph, initial] = await Promise.all([
    getSeoSchemas({
      contentType: 'about',
      extraNodes: [
        buildProfilePageSchema({
          id: `${ABOUT_URL}#profilepage`,
          url: ABOUT_URL,
          name: 'About Prince Pandey',
          personId: `${ABOUT_URL}#person`,
          breadcrumbId: `${ABOUT_URL}#breadcrumb`,
          primaryImageId: `${ABOUT_URL}#primaryimage`,
        }),
      ],
    }),
    getAboutData(),
  ])
  return (
    <>
      <SchemaScript schemas={graph} />
      <AboutClient initial={initial} />
    </>
  )
}
