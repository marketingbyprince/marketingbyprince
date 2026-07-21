import HomeClient from './HomeClient'
import { supabase } from '@/lib/supabase'

export const metadata = {
  title: 'Performance Marketing Consultant India | Prince Pandey',
  description: 'Results-driven PPC, Meta Ads, SEO & CRO services. 40+ clients, 3-5x ROAS. Based in Panchkula, serving pan-India.',
  alternates: { canonical: 'https://marketingbyprince.com' },
}

export const revalidate = 300

async function getHeroSlides() {
  try {
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('hero_slides')
      .select('id,image_url,alt_text,display_order')
      .eq('is_active', true)
      .lte('start_date', now)
      .or('end_date.is.null,end_date.gte.' + now)
      .order('display_order', { ascending: true })
    return data || []
  } catch {
    return []
  }
}

async function getServices() {
  try {
    const { data } = await supabase
      .from('services')
      .select('id,title,description,cta_link')
      .eq('is_active', true)
      .eq('show_on_homepage', true)
      .order('homepage_order', { ascending: true })
      .limit(10)
    return data || []
  } catch {
    return []
  }
}

export default async function Page() {
  const [heroSlides, services] = await Promise.all([getHeroSlides(), getServices()])
  return <HomeClient initialHeroSlides={heroSlides} initialServices={services} />
}
