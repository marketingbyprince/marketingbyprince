import AboutClient from './AboutClient'
import SchemaScript from '@/components/SchemaScript'
import { supabase } from '@/lib/supabase'
import { getSeoMeta, getSeoSchemas } from '@/lib/seo'

export const dynamic = 'force-dynamic'

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
    },
  })
}

export default async function Page() {
  const [schemas, initial] = await Promise.all([
    getSeoSchemas({ contentType: 'about' }),
    getAboutData(),
  ])
  return (
    <>
      <SchemaScript schemas={schemas} />
      <AboutClient initial={initial} />
    </>
  )
}
