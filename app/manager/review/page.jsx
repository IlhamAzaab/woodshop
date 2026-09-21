'use client'

import { useEffect, useState } from 'react'
import { Package, Clock, Loader2, RefreshCw, DollarSign, ArrowUpCircle } from 'lucide-react'
import Link from 'next/link'

export default function ManagerReview() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'stock'
  
  // State for products review
  const [sizePrices, setSizePrices] = useState({})
  const [acting, setActing] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  // State for stock review
  const [stockAdditions, setStockAdditions] = useState({})

  function fetchData() {
    setLoading(true)
    fetch('/api/products?all=true')
      .then((r) => r.json())
      .then((productsData) => {
        setProducts(productsData.products || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const pendingProducts = products.filter((p) => p.status === 'pending')
  const pendingStockProducts = products.filter((p) => p.status === 'approved' && p.sizes.some(s => s.stock_request > 0))

  // ----------------------------------------------------
  // PRODUCTS REVIEW LOGIC
  // ----------------------------------------------------
  function handleExpandProduct(product) {
    const isExpanded = expandedId === product.id
    setExpandedId(isExpanded ? null : product.id)
    if (!isExpanded) {
      const priceMap = {}
      product.sizes.forEach((s) => { priceMap[s.id] = s.price })
      setSizePrices((prev) => ({ ...prev, [product.id]: priceMap }))
    }
  }

  async function handleApproveProduct(id) {
    const priceMap = sizePrices[id] || {}
    const product = products.find((p) => p.id === id)
    if (!product) return

    const sizePriceArray = product.sizes.map((s) => ({
      id: s.id,
      final_price: Number(priceMap[s.id]) || s.price,
    }))

    setActing(id)
    try {
      const res = await fetch(`/api/products/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size_prices: sizePriceArray }),
      })
      if (res.ok) {
        fetchData()
        setExpandedId(null)
      } else alert('Failed to approve')
    } catch { alert('Failed to approve') }
    setActing(null)
  }

  async function handleRejectProduct(id) {
    setActing(id)
    try {
      const res = await fetch(`/api/products/${id}/reject`, { method: 'POST' })
      if (res.ok) fetchData()
    } catch {}
    setActing(null)
  }

  async function handleApproveStock(sizeId, defaultAddition) {
    const finalAddition = stockAdditions[sizeId] !== undefined ? stockAdditions[sizeId] : defaultAddition
    setActing(sizeId)
    try {
      const res = await fetch(`/api/product-sizes/${sizeId}/stock-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ final_addition: Number(finalAddition) })
      })
      if (res.ok) fetchData()
      else alert('Failed to approve stock')
    } catch { alert('Failed to approve stock') }
    setActing(null)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Manager Controls</p>
          <h1 className="mt-3 font-display text-4xl text-white">Pending Reviews</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
            Review new products, sales records, and stock additions submitted by Admins.
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

      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
            activeTab === 'products' ? 'bg-white/10 text-white' : 'text-qasr-beige/60 hover:text-white'
          }`}
        >
          <Package size={16} />
          New Products
          {pendingProducts.length > 0 && (
            <span className="ml-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
              {pendingProducts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
            activeTab === 'stock' ? 'bg-white/10 text-white' : 'text-qasr-beige/60 hover:text-white'
          }`}
        >
          <ArrowUpCircle size={16} />
          Stock Additions
          {pendingStockProducts.length > 0 && (
            <span className="ml-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
              {pendingStockProducts.reduce((acc, p) => acc + p.sizes.filter(s => s.stock_request > 0).length, 0)}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-qasr-gold" size={32} />
        </div>
      ) : activeTab === 'products' ? (
        // PRODUCTS TAB
        pendingProducts.length === 0 ? (
          <div className="luxe-panel flex flex-col items-center py-16 text-center">
            <Package size={40} className="text-qasr-beige/30" />
            <p className="mt-4 text-white">No products awaiting review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProducts.map((product) => {
              const isExpanded = expandedId === product.id
              const productPrices = sizePrices[product.id] || {}

              return (
                <div key={product.id} className="luxe-panel overflow-hidden">
                  <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                    <div className="flex shrink-0 gap-2 overflow-x-auto pb-2 sm:pb-0 w-full md:w-auto md:max-w-[280px]">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        product.image_urls.map((url, idx) => (
                          <div key={idx} className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                            <img src={url} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                          <Package size={20} className="text-qasr-beige/30" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-medium text-white">{product.name}</h3>
                      <p className="mt-0.5 text-sm text-qasr-beige/60">{product.category_name}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        onClick={() => handleExpandProduct(product)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                      >
                        {isExpanded ? 'Cancel' : 'Review'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/10 bg-black/20 p-5">
                      <div className="grid gap-4 lg:grid-cols-2">
                        {product.sizes.map((sizeItem) => (
                          <div key={sizeItem.id} className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{sizeItem.size}</p>
                              <p className="mt-1 text-xs text-qasr-beige/50">Admin price: ₹{sizeItem.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-qasr-beige/50">₹</span>
                              <input
                                type="number"
                                className="w-32 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-qasr-gold/50"
                                value={productPrices[sizeItem.id] || ''}
                                onChange={(e) => setSizePrices(p => ({ ...p, [product.id]: { ...p[product.id], [sizeItem.id]: e.target.value } }))}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={() => handleRejectProduct(product.id)}
                          disabled={acting === product.id}
                          className="rounded-xl border border-red-500/30 px-5 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                        >
                          Reject Product
                        </button>
                        <button
                          onClick={() => handleApproveProduct(product.id)}
                          disabled={acting === product.id}
                          className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                        >
                          Approve Product
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      ) : (
        // STOCK TAB
        pendingStockProducts.length === 0 ? (
          <div className="luxe-panel flex flex-col items-center py-16 text-center">
            <ArrowUpCircle size={40} className="text-qasr-beige/30" />
            <p className="mt-4 text-white">No pending stock requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingStockProducts.map((product) => (
              <div key={product.id} className="luxe-panel p-5">
                <h3 className="text-lg font-medium text-white mb-4">{product.name}</h3>
                <div className="space-y-3">
                  {product.sizes.filter(s => s.stock_request > 0).map(s => (
                    <div key={s.id} className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm font-medium text-white">{s.size}</p>
                        <p className="mt-1 text-xs text-qasr-beige/50">Current Stock: {s.stock}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-qasr-beige/50">Requested Addition</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm text-yellow-400">+</span>
                            <input
                              type="number"
                              className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-sm text-white outline-none focus:border-qasr-gold/50"
                              value={stockAdditions[s.id] !== undefined ? stockAdditions[s.id] : s.stock_request}
                              onChange={(e) => setStockAdditions(prev => ({ ...prev, [s.id]: e.target.value }))}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleApproveStock(s.id, s.stock_request)}
                          disabled={acting === s.id}
                          className="mt-4 rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {acting === s.id ? '...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  )
}
