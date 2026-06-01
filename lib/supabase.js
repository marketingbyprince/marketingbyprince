import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''

const isValidUrl = (url) => {
  try { return Boolean(new URL(url)) } catch { return false }
}

const createSafe = (url, key, opts) => {
  if (!isValidUrl(url)) return null
  return createClient(url, key, opts)
}

const emptyResult = Promise.resolve({ data: [], error: null })
const nullResult = Promise.resolve({ data: null, error: null })
const mockChain = {
  select: () => mockChain,
  eq: () => mockChain,
  not: () => mockChain,
  is: () => mockChain,
  in: () => mockChain,
  order: () => mockChain,
  limit: () => mockChain,
  single: () => nullResult,
  then: (resolve) => emptyResult.then(resolve),
}
const mockFrom = () => mockChain

export const supabase = createSafe(supabaseUrl, supabaseAnonKey) || {
  from: mockFrom,
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve({}),
  },
  storage: { from: () => ({ upload: () => Promise.resolve({ data: null, error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
}

export const supabaseAdmin = (serviceKey && isValidUrl(supabaseUrl))
  ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : supabase
