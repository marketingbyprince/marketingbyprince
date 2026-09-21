import { NextResponse } from 'next/server'

// The Vercel-assigned production alias must never compete with the real
// domain for SEO — permanently redirect it to marketingbyprince.com.
// Scoped to this exact host so preview deployments (*.vercel.app) are
// left untouched.
const VERCEL_ALIAS = 'marketingbyprince.vercel.app'
const CANONICAL_HOST = 'marketingbyprince.com'

export function middleware(request) {
  const { host } = request.nextUrl

  if (host === VERCEL_ALIAS) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`)
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
