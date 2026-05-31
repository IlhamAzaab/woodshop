'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Clock, TrendingUp, Loader2, Users, ArrowRight } from 'lucide-react'

export default function ManagerDashboard() {
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
  const approved = products.filter((p) => p.status === 'approved')
  const totalRevenue = approved.reduce((s, p) => s + (p.selling_price || 0), 0)
  const totalProfit = approved.reduce((s, p) => s + (p.profit || 0), 0)

  const stats = [
    { label: 'Total Products', value: total, display: String(total), Icon: Package, color: 'text-white' },
    { label: 'Pending Approval', value: pending, display: String(pending), Icon: Clock, color: 'text-yellow-400' },
    { label: 'Total Revenue', value: totalRevenue, display: `₹${totalRevenue.toLocaleString('en-IN')}`, Icon: TrendingUp, color: 'text-qasr-gold' },
    { label: 'Total Profit', value: totalProfit, display: `₹${totalProfit.toLocaleString('en-IN')}`, Icon: TrendingUp, color: totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
  ]

  const quickActions = [
    { label: 'Review Products', description: 'Approve, set pricing, view profit analysis', href: '/manager/products', Icon: Package },
    { label: 'Manage Admins', description: 'Create and manage admin accounts', href: '/manager/admins', Icon: Users },
  ]

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Manager Dashboard</p>
        <h1 className="mt-3 font-display text-4xl text-white">Business Overview</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
          Review products, approve listings, and monitor profit performance.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-qasr-gold" size={32} />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, display, Icon, color }) => (
              <div key={label} className="luxe-panel p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/5 p-2.5">
                    <Icon size={18} className="text-qasr-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-qasr-beige/60">{label}</p>
                    <p className={`mt-0.5 font-display text-2xl ${color}`}>{display}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pending > 0 && (
            <Link href="/manager/products" className="block rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 transition hover:bg-yellow-500/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-yellow-400" />
                  <p className="text-sm text-yellow-300">
                    <strong>{pending}</strong> product{pending > 1 ? 's' : ''} waiting for your approval
                  </p>
                </div>
                <ArrowRight size={16} className="text-yellow-400" />
              </div>
            </Link>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map(({ label, description, href, Icon }) => (
              <Link key={href} href={href} className="luxe-panel group flex items-center gap-4 p-6 transition hover:border-qasr-gold/30">
                <div className="rounded-xl bg-qasr-gold/10 p-3">
                  <Icon size={22} className="text-qasr-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white group-hover:text-qasr-gold transition">{label}</h3>
                  <p className="mt-1 text-sm text-qasr-beige/60">{description}</p>
                </div>
                <ArrowRight size={18} className="text-qasr-beige/30 transition group-hover:text-qasr-gold" />
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
