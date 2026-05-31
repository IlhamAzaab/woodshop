import 'server-only'

import { getSupabaseServerClient } from './supabase-server'

export async function getSessionProfile() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, role, created_at')
    .eq('id', user.id)
    .single()

  return { user, profile: profile || null }
}
