'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { getLoginRedirect } from '../lib/auth'

export default function AuthPanel({ role, title, subtitle }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError) {
      setError(profileError.message)
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (profile?.role !== role) {
      setError('You do not have permission to access this portal.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    window.location.href = getLoginRedirect(role)
  }

  return (
    <div className="luxe-panel w-full max-w-md p-8 shadow-luxe">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">QASR</p>
        <h1 className="mt-3 font-display text-4xl text-white">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-qasr-beige/75">{subtitle}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-qasr-beige/50 focus:border-qasr-gold/60"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-qasr-beige/50 focus:border-qasr-gold/60"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="gold-button w-full disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      <p className="mt-6 text-xs leading-6 text-qasr-beige/55">
        Secure Supabase authentication with role-based access control.
      </p>
    </div>
  )
}
