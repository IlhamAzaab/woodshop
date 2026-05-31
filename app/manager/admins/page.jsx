'use client'

import { useState, useEffect } from 'react'
import { Trash2, UserPlus, ShieldAlert, Loader2, RefreshCw } from 'lucide-react'

export default function ManagerAdmins() {
  const [admins, setAdmins] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load admins
  async function loadAdmins() {
    setFetching(true)
    setError('')
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to load admin accounts')
      const data = await res.json()
      setAdmins(data.users || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  // Create admin
  async function handleCreateAdmin(e) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create admin')
      
      setSuccess(`Successfully created admin account: ${email}`)
      setEmail('')
      setPassword('')
      loadAdmins()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Delete admin
  async function handleDeleteAdmin(id, adminEmail) {
    if (!confirm(`Are you sure you want to delete admin account: ${adminEmail}?`)) return

    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete admin')
      
      setSuccess(`Successfully deleted admin account: ${adminEmail}`)
      loadAdmins()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="space-y-8">
      {/* Page Title & Intro */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Admins</p>
          <h1 className="mt-3 font-display text-4xl text-white">Admin Accounts</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
            Create, view, and manage admin employee accounts. Admins can add and upload new products to the catalog.
          </p>
        </div>
        <button
          onClick={loadAdmins}
          disabled={fetching}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-qasr-beige/80 transition hover:bg-white/10 hover:text-white"
        >
          <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
          Refresh Accounts
        </button>
      </div>

      {/* Grid: Form and List */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Creation Form */}
        <div className="luxe-panel p-6 lg:col-span-1 h-fit">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-qasr-gold/10 p-2.5 text-qasr-gold">
              <UserPlus size={20} />
            </div>
            <h2 className="font-display text-xl text-white">Create Admin</h2>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="text-xs text-qasr-beige/65 block mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. employee@qasr.com"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-qasr-beige/50 focus:border-qasr-gold/60"
              />
            </div>

            <div>
              <label className="text-xs text-qasr-beige/65 block mb-2">Temporary Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-qasr-beige/50 focus:border-qasr-gold/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gold-button w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Creating...
                </span>
              ) : (
                'Create Admin'
              )}
            </button>
          </form>

          {/* Feedback messages inside card */}
          {error && (
            <div className="mt-4 flex gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
              <ShieldAlert size={16} className="shrink-0 text-red-400" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              <p>{success}</p>
            </div>
          )}
        </div>

        {/* Existing Accounts List */}
        <div className="luxe-panel p-6 lg:col-span-2">
          <h2 className="font-display text-xl text-white mb-6">Active Admin Accounts</h2>

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-qasr-gold" size={32} />
              <p className="text-xs text-qasr-beige/60">Fetching admin list...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
              <p className="text-sm text-qasr-beige/60">No admin accounts found.</p>
              <p className="text-xs text-qasr-beige/40 mt-1">Use the panel on the left to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-qasr-beige">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-qasr-beige/50">
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Created At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-medium text-white">{admin.email}</td>
                      <td className="py-4 px-4 text-qasr-beige/60">
                        {new Date(admin.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                          className="rounded-xl border border-white/10 bg-white/5 p-2 text-qasr-beige/60 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          title="Delete Admin"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
