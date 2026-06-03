import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// Body: [{ id, display_order }, ...]
export async function PATCH(req) {
  const db = getAdmin()
  if (!db) return NextResponse.json({ error: 'No DB' }, { status: 500 })

  const items = await req.json()
  const updates = items.map(({ id, display_order }) =>
    db.from('hero_slides').update({ display_order }).eq('id', id)
  )
  await Promise.all(updates)
  return NextResponse.json({ success: true })
}
