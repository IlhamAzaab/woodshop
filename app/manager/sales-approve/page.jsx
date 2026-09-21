'use client'

import { useEffect, useState } from 'react'
import { DollarSign, Loader2, RefreshCw } from 'lucide-react'

export default function SalesApprovePage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [salePrices, setSalePrices] = useState({})
  const [acting, setActing] = useState(null)

  function fetchData() {
    setLoading(true)
    fetch('/api/sales?status=pending')
      .then((r) => r.json())
      .then((data) => {
        setSales(data.sales || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleApproveSale(sale) {
    const finalPrice = salePrices[sale.id] !== undefined ? salePrices[sale.id] : sale.admin_price
    setActing(sale.id)
    try {
      const res = await fetch(`/api/sales/${sale.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ final_price: finalPrice })
      })
      if (res.ok) fetchData()
      else alert('Failed to approve sale')
    } catch { alert('Failed to approve sale') }
    setActing(null)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Manager Controls</p>
          <h1 className="mt-3 font-display text-4xl text-white">Sales Approval</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
            Review and approve manual sales submitted by Admins.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-qasr-beige/80 transition hover:bg-white/10 hover:text-white"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-qasr-gold" size={32} />
        </div>
      ) : sales.length === 0 ? (
        <div className="luxe-panel flex flex-col items-center py-16 text-center">
          <DollarSign size={40} className="text-qasr-beige/30" />
          <p className="mt-4 text-white">No pending sales to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <div key={sale.id} className="luxe-panel p-5">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-medium text-white">{sale.product?.name}</h3>
                  <p className="text-sm text-qasr-beige/60">Category: {sale.product?.category?.name}</p>
                  <div className="mt-2 text-sm text-qasr-beige/80">
                    <span className="font-medium text-white">{sale.size?.size}</span> — Sold: <span className="font-medium text-white">{sale.quantity} items</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:w-64">
                  <div>
                    <p className="text-xs text-qasr-beige/50">Admin Sold Price (per item)</p>
                    <p className="text-lg font-medium text-white">₹{sale.admin_price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-qasr-beige/50">Final Approved Price</p>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-qasr-gold/50"
                      value={salePrices[sale.id] !== undefined ? salePrices[sale.id] : sale.admin_price}
                      onChange={(e) => setSalePrices(p => ({ ...p, [sale.id]: e.target.value }))}
                    />
                  </div>
                  <button
                    onClick={() => handleApproveSale(sale)}
                    disabled={acting === sale.id}
                    className="mt-2 w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {acting === sale.id ? 'Approving...' : 'Approve Sale'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
