'use server'

import { revalidatePath } from 'next/cache'

// Central choke point admin saves call right after a DB write succeeds, so
// the public pages built from that data stop serving whatever Next cached
// for them. Accepts plain path strings ('/about') or, for a dynamic route,
// { path: '/services/[slug]', type: 'page' } to revalidate every page that
// matches that pattern without having to resolve which slug changed.
export async function revalidatePublicPaths(paths = []) {
  for (const p of paths) {
    if (typeof p === 'string') revalidatePath(p)
    else revalidatePath(p.path, p.type)
  }
}
