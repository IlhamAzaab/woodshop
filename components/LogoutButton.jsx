'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, LogOut } from 'lucide-react'
import { getSupabaseBrowserClient } from '../lib/supabase-client'

export default function LogoutButton({ className = '' }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    router.replace('/')
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-qasr-beige/80 transition hover:border-qasr-gold/50 hover:text-qasr-gold disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
      {loading ? 'Signing out...' : 'Logout'}
    </button>
  )
}
