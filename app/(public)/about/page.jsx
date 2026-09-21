import AboutClient from './AboutClient'
import SchemaScript from '@/components/SchemaScript'
import FaqSection from '@/components/FaqSection'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas, getPageFaqs, buildProfilePageSchema } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const ABOUT_URL = 'https://marketingbyprince.com/about'

async function getAboutData() {
  const [{ data: aboutRow }, { data: experience }, { data: skills }, { data: education }] = await Promise.all([
    supabase.from('about_content')
      .select('profile_image_url, name, tagline, description, phone, email, location, is_location_visible')
      .single(),
    supabase.from('work_experience')
      .select('role, company, start_date, end_date, is_current, description')
      .order('sort_order'),
    supabase.from('skills')
      .select('name, category')
      .order('category').order('sort_order'),
    supabase.from('education')
      .select('degree, field_of_study, institution, start_year, end_year, is_current')
      .order('sort_order'),
  ])

  // Only send location to the client when the admin has actually made it
  // visible. is_location_visible itself never needs to leave the server.
  const about = aboutRow ? {
    profile_image_url: aboutRow.profile_image_url,
    name: aboutRow.name,
    tagline: aboutRow.tagline,
    description: aboutRow.description,
    phone: aboutRow.phone,
    email: aboutRow.email,
    ...(aboutRow.is_location_visible && aboutRow.location ? { location: aboutRow.location } : {}),
  } : null

  return { about, experience: experience || [], skills: skills || [], education: education || [] }
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
  const [graph, initial, faqs] = await Promise.all([
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
    getPageFaqs('about'),
  ])
  return (
    <>
      <SchemaScript schemas={graph} />
      <AboutClient initial={initial} />
      <FaqSection faqs={faqs} />
    </>
  )
}
