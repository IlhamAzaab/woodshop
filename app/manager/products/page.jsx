'use client'

import { useEffect, useState } from 'react'
import { Package, Clock, CheckCircle, XCircle, TrendingUp, Loader2, Eye, ShoppingCart } from 'lucide-react'

const productTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

export default function ManagerProducts() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [managerView, setManagerView] = useState('products') // 'products' or 'sales'
  const [productTab, setProductTab] = useState('all')
  const [prices, setPrices] = useState({})
  const [acting, setActing] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  function fetchData() {
    setLoading(true)
    // Fetch products
    fetch('/api/products?all=true')
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})

    // Fetch sales
    fetch('/api/sales')
      .then((r) => r.json())
      .then((d) => setSales(d.sales || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Product actions
  async function handleApproveProduct(id) {
    const price = Number(prices[id])
    if (!price || price <= 0) {
      alert('Please enter a valid selling price')
      return
    }

    setActing(id)
    try {
      const res = await fetch(`/api/products/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selling_price: price }),
      })
      if (res.ok) {
        fetchData()
        setPrices((prev) => ({ ...prev, [id]: '' }))
      }
    } catch {}
    setActing(null)
  }

  async function handleRejectProduct(id) {
    setActing(id)
    try {
      const res = await fetch(`/api/products/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) fetchData()
    } catch {}
    setActing(null)
  }

  // Sale actions
  async function handleSaleAction(id, action) {
    setActing(id)
    try {
      const res = await fetch('/api/sales/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      })
      if (res.ok) {
        fetchData()
      } else {
        const err = await res.json()
        alert(err.message || 'Action failed')
      }
    } catch (e) {
      alert('Failed to process sale request.')
    }
    setActing(null)
  }

  const filteredProducts = productTab === 'all' ? products : products.filter((p) => p.status === productTab)
  const productCounts = {
    all: products.length,
    pending: products.filter((p) => p.status === 'pending').length,
    approved: products.filter((p) => p.status === 'approved').length,
    rejected: products.filter((p) => p.status === 'rejected').length,
  }

  const pendingSales = sales.filter((s) => s.status === 'pending')
  const approvedSales = sales.filter((s) => s.status === 'approved')

  // Calculate profit values
  const totalRevenue = approvedSales.reduce((s, sale) => s + (sale.sold_price * sale.quantity || 0), 0)
  const totalProfit = approvedSales.reduce(
    (s, sale) => s + ((sale.sold_price - sale.product_total_cost) * sale.quantity || 0),
    0
  )

  function getProfitColor(profit, cost) {
    if (cost <= 0) return 'text-qasr-beige/50'
    const pct = (profit / cost) * 100
    if (pct >= 20) return 'text-emerald-400'
    if (pct >= 10) return 'text-yellow-400'
    return 'text-red-400'
  }

  function getProfitPct(profit, cost) {
    if (cost <= 0) return '0'
    return ((profit / cost) * 100).toFixed(1)
  }

  const summaryStats = [
    { label: 'Total Products', value: products.length, Icon: Package, color: 'text-white' },
    { label: 'Pending Sales Review', value: pendingSales.length, Icon: Clock, color: 'text-yellow-400' },
    { label: 'Sales Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, Icon: TrendingUp, color: 'text-qasr-gold' },
    { label: 'Sales Profit', value: `₹${totalProfit.toLocaleString('en-IN')}`, Icon: TrendingUp, color: totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
  ]

  return (
    <section className="space-y-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Manager Controls</p>
          <h1 className="mt-3 font-display text-4xl text-white">Review & Approvals</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
            Approve new catalog products, review sale requests, set pricing structures, and view business stats.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-qasr-beige/80 transition hover:bg-white/10 hover:text-white"
        >
          <Loader2 size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map(({ label, value, Icon, color }) => (
          <div key={label} className="luxe-panel flex items-center gap-3 p-4">
            <div className="rounded-xl bg-white/5 p-2">
              <Icon size={16} className="text-qasr-gold" />
            </div>
            <div>
              <p className="text-[11px] text-qasr-beige/50">{label}</p>
              <p className={`font-display text-xl ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Switch */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setManagerView('products')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
            managerView === 'products' ? 'bg-qasr-gold text-qasr-night' : 'text-qasr-beige/75 hover:bg-white/5 hover:text-white'
          }`}
        >
          Product Listing Reviews ({productCounts.pending})
        </button>
        <button
          onClick={() => setManagerView('sales')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
            managerView === 'sales' ? 'bg-qasr-gold text-qasr-night' : 'text-qasr-beige/75 hover:bg-white/5 hover:text-white'
          }`}
        >
          Sale Transaction Reviews ({pendingSales.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-qasr-gold" size={32} />
        </div>
      ) : managerView === 'products' ? (
        <>
          {/* Tabs for products */}
          <div className="flex gap-1 rounded-2xl border border-white/10 bg-black/30 p-1 w-fit">
            {productTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setProductTab(tab.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition ${
                  productTab === tab.key
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-qasr-beige/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-qasr-beige/50">
                  {productCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="luxe-panel flex flex-col items-center py-16 text-center">
              <Package size={40} className="text-qasr-beige/30" />
              <p className="mt-4 text-white">No products in this category</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const livePrice = Number(prices[product.id]) || 0
                const liveProfit = product.status === 'pending' ? livePrice - product.total_cost : product.profit
                const isExpanded = expandedId === product.id

                return (
                  <div key={product.id} className="luxe-panel overflow-hidden">
                    {/* Main Row */}
                    <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                      {/* Image */}
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package size={24} className="text-qasr-beige/30" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-medium text-white">{product.name}</h3>
                        <p className="mt-0.5 text-sm text-qasr-beige/60">{product.category}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                          <span className="text-qasr-beige/50">Cost: <span className="text-white">₹{product.total_cost?.toLocaleString('en-IN')}</span></span>
                          {product.status === 'approved' && (
                            <>
                              <span className="text-qasr-beige/50">Price: <span className="text-qasr-gold font-medium">₹{product.selling_price?.toLocaleString('en-IN')}</span></span>
                              <span className="text-qasr-beige/50">
                                Profit: <span className={getProfitColor(product.profit, product.total_cost)}>
                                  ₹{product.profit?.toLocaleString('en-IN')} ({getProfitPct(product.profit, product.total_cost)}%)
                                </span>
                              </span>
                            </>
                          )}
                          <span className="text-qasr-beige/50">Stock: <span className="text-white">{product.stock} items</span></span>
                        </div>
                      </div>

                      {/* Actions/Badge */}
                      <div className="flex shrink-0 items-center gap-3">
                        {product.status === 'pending' && (
                          <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">Pending</span>
                        )}
                        {product.status === 'approved' && (
                          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">Approved</span>
                        )}
                        {product.status === 'rejected' && (
                          <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">Rejected</span>
                        )}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : product.id)}
                          className="rounded-full border border-white/10 p-2 text-qasr-beige/60 transition hover:text-qasr-gold"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-black/20 p-5">
                        {product.images?.length > 0 && (
                          <div className="mb-5 flex gap-3 overflow-x-auto pb-2">
                            {product.images.map((url, i) => (
                              <img key={i} src={url} alt="" className="h-32 w-32 shrink-0 rounded-xl border border-white/10 object-cover" />
                            ))}
                          </div>
                        )}

                        {/* Material breakdown */}
                        <div className="grid gap-3 md:grid-cols-2">
                          {product.board_details && (
                            <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                              <p className="text-xs font-semibold text-qasr-beige/50">🪵 Board</p>
                              <p className="mt-1 text-sm text-white">{product.board_details} {product.board_size ? `(${product.board_size})` : ''}</p>
                              <p className="mt-0.5 text-xs text-qasr-gold">₹{product.board_cost?.toLocaleString('en-IN')}</p>
                            </div>
                          )}
                          {product.glass_details && (
                            <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                              <p className="text-xs font-semibold text-qasr-beige/50">🪟 Glass</p>
                              <p className="mt-1 text-sm text-white">{product.glass_details} {product.glass_size ? `(${product.glass_size})` : ''}</p>
                              <p className="mt-0.5 text-xs text-qasr-gold">₹{product.glass_cost?.toLocaleString('en-IN')}</p>
                            </div>
                          )}
                          {product.aluminum_details && (
                            <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                              <p className="text-xs font-semibold text-qasr-beige/50">🔩 Aluminum</p>
                              <p className="mt-1 text-sm text-white">{product.aluminum_details}</p>
                              <p className="mt-0.5 text-xs text-qasr-gold">₹{product.aluminum_cost?.toLocaleString('en-IN')}</p>
                            </div>
                          )}
                          {product.other_cost > 0 && (
                            <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                              <p className="text-xs font-semibold text-qasr-beige/50">📦 Other Cost</p>
                              <p className="mt-0.5 text-xs text-qasr-gold">₹{product.other_cost?.toLocaleString('en-IN')}</p>
                            </div>
                          )}
                        </div>

                        {/* Total Cost */}
                        <div className="mt-4 flex items-center justify-between rounded-xl border border-qasr-gold/20 bg-qasr-gold/5 px-4 py-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-qasr-gold">Total Material Cost</span>
                          <span className="font-display text-xl text-white">₹{product.total_cost?.toLocaleString('en-IN')}</span>
                        </div>

                        {/* Actions for Pending */}
                        {product.status === 'pending' && (
                          <div className="mt-5 rounded-2xl border border-white/10 bg-white/3 p-4">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-qasr-beige/60">Set price and approve listing</p>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                              <div className="flex-1">
                                <label className="mb-1 block text-xs text-qasr-beige/50">Selling Price (₹)</label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Enter selling price"
                                  value={prices[product.id] || ''}
                                  onChange={(e) => setPrices((prev) => ({ ...prev, [product.id]: e.target.value }))}
                                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-qasr-beige/50 focus:border-qasr-gold/60"
                                />
                              </div>

                              {livePrice > 0 && (
                                <div className="flex-1">
                                  <p className="text-xs text-qasr-beige/50">Estimated Profit</p>
                                  <p className={`font-display text-xl ${liveProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    ₹{liveProfit.toLocaleString('en-IN')}
                                    <span className="ml-2 text-sm">
                                      ({product.total_cost > 0 ? ((liveProfit / product.total_cost) * 100).toFixed(1) : '0'}%)
                                    </span>
                                  </p>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveProduct(product.id)}
                                  disabled={acting === product.id}
                                  className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                >
                                  {acting === product.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectProduct(product.id)}
                                  disabled={acting === product.id}
                                  className="flex items-center gap-2 rounded-full border border-red-500/40 px-5 py-3 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {product.description && (
                          <p className="mt-4 text-sm leading-7 text-qasr-beige/60">{product.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        /* Sales approvals panel */
        sales.length === 0 ? (
          <div className="luxe-panel flex flex-col items-center py-16 text-center">
            <ShoppingCart size={40} className="text-qasr-beige/30" />
            <p className="mt-4 text-white">No sales transactions submitted yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => {
              const profitPerItem = sale.sold_price - sale.product_total_cost
              const totalSaleProfit = profitPerItem * sale.quantity
              const isPending = sale.status === 'pending'

              return (
                <div key={sale.id} className="luxe-panel p-5 flex flex-col gap-4 md:flex-row md:items-center justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-white">{sale.product_name}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-qasr-beige/80">
                        {sale.product_category}
                      </span>
                    </div>

                    <div className="grid gap-x-6 gap-y-1.5 grid-cols-2 md:flex md:flex-wrap text-xs text-qasr-beige/60">
                      <p>Quantity: <span className="text-white font-medium">{sale.quantity} items</span></p>
                      <p>
                        Sold Price: <span className="text-white font-medium">₹{sale.sold_price.toLocaleString('en-IN')}</span> 
                        {sale.sold_price !== sale.product_selling_price && (
                          <span className="ml-1 text-qasr-beige/40">(Base: ₹{sale.product_selling_price.toLocaleString('en-IN')})</span>
                        )}
                      </p>
                      <p>Total Revenue: <span className="text-qasr-gold font-medium">₹{(sale.sold_price * sale.quantity).toLocaleString('en-IN')}</span></p>
                      <p>
                        Estimated Profit: <span className={`font-semibold ${totalSaleProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ₹{totalSaleProfit.toLocaleString('en-IN')} ({sale.product_total_cost > 0 ? getProfitPct(totalSaleProfit, sale.product_total_cost * sale.quantity) : '0'}%)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isPending ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaleAction(sale.id, 'approve')}
                          disabled={acting === sale.id}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                        >
                          {acting === sale.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                          Approve Sale
                        </button>
                        <button
                          onClick={() => handleSaleAction(sale.id, 'reject')}
                          disabled={acting === sale.id}
                          className="flex items-center gap-1.5 rounded-xl border border-red-500/40 px-4 py-2 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <XCircle size={12} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {sale.status === 'approved' && (
                          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 flex items-center gap-1">
                            <CheckCircle size={10} /> Approved
                          </span>
                        )}
                        {sale.status === 'rejected' && (
                          <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 flex items-center gap-1">
                            <XCircle size={10} /> Rejected
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </section>
  )
}
