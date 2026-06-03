import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function PUT(req, { params }) {
  const db = getAdmin()
  if (!db) return NextResponse.json({ error: 'No DB' }, { status: 500 })

  const body = await req.json()
  const { data, error } = await db
    .from('hero_slides')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(req, { params }) {
  const db = getAdmin()
  if (!db) return NextResponse.json({ error: 'No DB' }, { status: 500 })

  const { error } = await db.from('hero_slides').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
