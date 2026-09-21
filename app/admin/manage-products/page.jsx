'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Clock, CheckCircle, XCircle, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import ImageSlider from '../../../components/ImageSlider'

const statusConfig = {
  pending: { label: 'Pending', bg: 'bg-yellow-500/20', text: 'text-yellow-400', Icon: Clock },
  approved: { label: 'Approved', bg: 'bg-emerald-500/20', text: 'text-emerald-400', Icon: CheckCircle },
  rejected: { label: 'Rejected', bg: 'bg-red-500/20', text: 'text-red-400', Icon: XCircle },
}

export default function AdminManageProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestingStockFor, setRequestingStockFor] = useState(null)
  const [stockAddition, setStockAddition] = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const prodRes = await fetch('/api/products?all=true')
      const prodData = await prodRes.json()
      setProducts(prodData.products || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return
    setLoading(true)
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      await loadData()
    } catch {
      setLoading(false)
    }
  }

  async function handleStockRequest(sizeId) {
    const qty = parseInt(stockAddition, 10)
    if (!qty || qty <= 0) return alert('Quantity must be greater than 0')

    try {
      const res = await fetch(`/api/product-sizes/${sizeId}/stock-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty }),
      })
      if (res.ok) {
        alert('Stock addition requested!')
        setRequestingStockFor(null)
        setStockAddition('')
        await loadData()
      } else {
        alert('Failed to request stock')
      }
    } catch {
      alert('Error requesting stock')
    }
  }

  return (
    <section className="space-y-8">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Manage Products</p>
          <h1 className="mt-3 font-display text-4xl text-white">Product Overview</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
            View all your submitted products, their sizes, prices, stock, and approval status.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-qasr-beige/80 transition hover:bg-white/10 hover:text-white"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-qasr-gold" size={32} />
        </div>
      ) : products.length === 0 ? (
        <div className="luxe-panel flex flex-col items-center py-16 text-center">
          <Package size={40} className="text-qasr-beige/30" />
          <p className="mt-4 text-lg text-white">No products yet</p>
          <p className="mt-1 text-sm text-qasr-beige/60">
            Add a product first to start tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const cfg = statusConfig[product.status] || statusConfig.pending
            const StatusIcon = cfg.Icon

            return (
              <div key={product.id} className="luxe-panel overflow-hidden">
                <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start">
                  {/* Images */}
                  <div className="flex shrink-0 flex-wrap gap-2 w-full md:w-auto md:max-w-[280px]">
                    {product.image_urls && product.image_urls.length > 0 ? (
                      product.image_urls.map((url, idx) => (
                        <div key={idx} className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                          <img src={url} alt={`${product.name} - Image ${idx + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                        <Package size={24} className="text-qasr-beige/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-lg font-medium text-white transition hover:text-qasr-gold">
                            {product.name}
                          </h3>
                        </Link>
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}
                        >
                          <StatusIcon size={12} />
                          {cfg.label}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="rounded-lg p-2 text-red-400/60 transition hover:bg-red-400/10 hover:text-red-400"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-0.5 text-sm text-qasr-beige/60">{product.category_name}</p>
                    {product.description && (
                      <p className="mt-2 text-sm leading-7 text-qasr-beige/50 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Size variants */}
                    {product.sizes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.sizes.map((s) => {
                          const isMaterial =
                            product.category_name === 'Boards' ||
                            product.category_name === 'Aluminium'
                          return (
                            <div
                              key={s.id}
                              className="rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-xs"
                            >
                              <span className="font-medium text-white">{s.size}</span>
                              <span className="mx-1.5 text-qasr-beige/40">·</span>
                              {product.status === 'approved' ? (
                                <span className="text-qasr-gold">
                                  ₹{s.final_price.toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className="text-qasr-beige/60">
                                  ₹{s.price.toLocaleString('en-IN')}
                                </span>
                              )}
                              {!isMaterial && (
                                <>
                                  <span className="mx-1.5 text-qasr-beige/40">·</span>
                                  <span
                                    className={s.stock <= 5 ? 'text-red-400' : 'text-qasr-beige/60'}
                                  >
                                    {s.stock} in stock
                                  </span>
                                  {s.stock_request > 0 ? (
                                    <span className="ml-2 text-yellow-400 text-[10px] uppercase tracking-wider">
                                      (+{s.stock_request} Pending)
                                    </span>
                                  ) : requestingStockFor === s.id ? (
                                    <div className="ml-2 inline-flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="1"
                                        value={stockAddition}
                                        onChange={(e) => setStockAddition(e.target.value)}
                                        className="w-12 rounded bg-black/40 px-1 py-0.5 text-center text-xs text-white outline-none"
                                        placeholder="+"
                                      />
                                      <button
                                        onClick={() => handleStockRequest(s.id)}
                                        className="rounded bg-qasr-gold px-1.5 py-0.5 text-[10px] text-black"
                                      >
                                        Send
                                      </button>
                                      <button
                                        onClick={() => setRequestingStockFor(null)}
                                        className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white"
                                      >
                                        X
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setRequestingStockFor(s.id)
                                        setStockAddition('')
                                      }}
                                      className="ml-2 rounded px-1.5 py-0.5 text-[10px] bg-white/10 text-white hover:bg-white/20 transition"
                                    >
                                      Add Stock
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
