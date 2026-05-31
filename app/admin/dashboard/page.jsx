'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Clock, CheckCircle, XCircle, Loader2, PackagePlus } from 'lucide-react'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?all=true')
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total = products.length
  const pending = products.filter((p) => p.status === 'pending').length
  const approved = products.filter((p) => p.status === 'approved').length
  const rejected = products.filter((p) => p.status === 'rejected').length

  const stats = [
    { label: 'Total Products', value: total, Icon: Package, color: 'text-white' },
    { label: 'Pending', value: pending, Icon: Clock, color: 'text-yellow-400' },
    { label: 'Approved', value: approved, Icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Rejected', value: rejected, Icon: XCircle, color: 'text-red-400' },
  ]

  const recent = products.slice(0, 5)

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Admin Dashboard</p>
        <h1 className="mt-3 font-display text-4xl text-white">Shop Operations</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
          Add products, upload photos, and track approval status.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-qasr-gold" size={32} />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, Icon, color }) => (
              <div key={label} className="luxe-panel p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/5 p-2.5">
                    <Icon size={18} className="text-qasr-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-qasr-beige/60">{label}</p>
                    <p className={`mt-0.5 font-display text-2xl ${color}`}>{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="luxe-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-qasr-gold">Recent Products</h2>
              <Link href="/admin/add-product" className="flex items-center gap-2 text-xs text-qasr-gold hover:text-qasr-beige transition">
                <PackagePlus size={14} /> Add New
              </Link>
            </div>

            {recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-qasr-beige/50">No products yet. Start by adding one!</p>
            ) : (
              <div className="space-y-3">
                {recent.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/3 px-4 py-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center"><Package size={14} className="text-qasr-beige/30" /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{p.name}</p>
                      <p className="text-xs text-qasr-beige/50">{p.category}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${
                      p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      p.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
