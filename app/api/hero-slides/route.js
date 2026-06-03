import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET() {
  const db = getAdmin()
  if (!db) return NextResponse.json([])

  const now = new Date().toISOString()
  const { data, error } = await db
    .from('hero_slides')
    .select('id,image_url,alt_text,display_order')
    .eq('is_active', true)
    .lte('start_date', now)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('display_order', { ascending: true })

  if (error) return NextResponse.json([])
  return NextResponse.json(data ?? [])
}

export async function POST(req) {
  const db = getAdmin()
  if (!db) return NextResponse.json({ error: 'No DB' }, { status: 500 })

  const body = await req.json()
  const { data, error } = await db.from('hero_slides').insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
