import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export const revalidate = 3600

export default async function AuthorIndexPage() {
  const { data } = await supabase
    .from('author_profile')
    .select('slug')
    .not('slug', 'is', null)
    .order('id')
    .limit(1)
    .single()

  if (data?.slug) redirect(`/author/${data.slug}`)
  redirect('/blog')
}
