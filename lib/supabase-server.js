import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        try {
          return cookieStore.get(name)?.value
        } catch {
          return undefined
        }
      },
      set(name, value, options) {
        try {
          cookieStore.set(name, value, options)
        } catch {
          // Cookies can be read-only in some server contexts.
        }
      },
      remove(name, options) {
        try {
          if (typeof cookieStore.delete === 'function') {
            cookieStore.delete(name)
            return
          }

          cookieStore.set(name, '', { ...options, maxAge: 0 })
        } catch {
          // Cookies can be read-only in some server contexts.
        }
      },
      getAll() {
        try {
          return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
        } catch {
          return []
        }
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Cookies can be read-only in some server contexts.
        }
      },
    },
  })
}
