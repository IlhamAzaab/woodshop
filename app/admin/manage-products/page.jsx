'use client'

import { useEffect, useState } from 'react'
import { Package, Clock, CheckCircle, XCircle, Loader2, RefreshCw, ShoppingCart, History, Edit3 } from 'lucide-react'

const statusConfig = {
  pending: { label: 'Pending', bg: 'bg-yellow-500/20', text: 'text-yellow-400', Icon: Clock },
  approved: { label: 'Approved', bg: 'bg-emerald-500/20', text: 'text-emerald-400', Icon: CheckCircle },
  rejected: { label: 'Rejected', bg: 'bg-red-500/20', text: 'text-red-400', Icon: XCircle },
}

export default function AdminManageProducts() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products') // 'products', 'register-sale', 'sales-history'
  
  // Stock edit states
  const [editingStockId, setEditingStockId] = useState(null)
  const [tempStock, setTempStock] = useState('')
  const [stockUpdating, setStockUpdating] = useState(false)

  // Sale form states
  const [selectedProductId, setSelectedProductId] = useState('')
  const [saleQuantity, setSaleQuantity] = useState(1)
  const [salePrice, setSalePrice] = useState('')
  const [saleLoading, setSaleLoading] = useState(false)
  const [saleError, setSaleError] = useState('')
  const [saleSuccess, setSaleSuccess] = useState('')

  // Load products and sales
  async function loadData() {
    setLoading(true)
    try {
      const prodRes = await fetch('/api/products?all=true')
      const prodData = await prodRes.json()
      setProducts(prodData.products || [])

      const saleRes = await fetch('/api/sales?my=true')
      const saleData = await saleRes.json()
      setSales(saleData.sales || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto-fill price when product changes
  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find((p) => p.id === selectedProductId)
      if (prod) {
        setSalePrice(prod.selling_price || '')
      }
    } else {
      setSalePrice('')
    }
  }, [selectedProductId, products])

  // Save stock change
  async function handleSaveStock(productId) {
    const stockVal = parseInt(tempStock)
    if (isNaN(stockVal) || stockVal < 0) {
      alert('Please enter a valid stock count.')
      return
    }

    setStockUpdating(true)
    try {
      const res = await fetch('/api/products/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, stock: stockVal }),
      })
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: stockVal } : p))
        )
        setEditingStockId(null)
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(errData.message || 'Failed to update stock. Please try again.')
      }
    } catch (err) {
      alert('Network error: Could not update stock. Check your connection.')
    }
    setStockUpdating(false)
  }

  // Register a sale
  async function handleRegisterSale(e) {
    e.preventDefault()
    if (!selectedProductId || saleQuantity <= 0 || !salePrice) return

    const prod = products.find((p) => p.id === selectedProductId)
    if (prod && prod.stock < saleQuantity) {
      setSaleError(`Insufficient stock. Only ${prod.stock} items left in stock.`)
      return
    }

    setSaleLoading(true)
    setSaleError('')
    setSaleSuccess('')

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProductId,
          quantity: Number(saleQuantity),
          sold_price: Number(salePrice),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to register sale')

      setSaleSuccess('Sale registered and sent to Manager for approval.')
      setSelectedProductId('')
      setSaleQuantity(1)
      setSalePrice('')
      loadData() // Reload everything to update lists
    } catch (err) {
      setSaleError(err.message)
    } finally {
      setSaleLoading(false)
    }
  }

  const approvedProducts = products.filter((p) => p.status === 'approved')

  return (
    <section className="space-y-8">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Manage Products</p>
          <h1 className="mt-3 font-display text-4xl text-white">Stock & Sales Panel</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
            Monitor approvals, adjust stock counts, and record sale transactions directly from here.
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

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-white/10 bg-black/30 p-1 w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition ${
            activeTab === 'products'
              ? 'bg-qasr-gold text-qasr-night font-semibold'
              : 'text-qasr-beige/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Package size={16} />
          Products & Stock
        </button>
        <button
          onClick={() => setActiveTab('register-sale')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition ${
            activeTab === 'register-sale'
              ? 'bg-qasr-gold text-qasr-night font-semibold'
              : 'text-qasr-beige/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingCart size={16} />
          Register a Sale
        </button>
        <button
          onClick={() => {
            setActiveTab('sales-history')
            loadData()
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition ${
            activeTab === 'sales-history'
              ? 'bg-qasr-gold text-qasr-night font-semibold'
              : 'text-qasr-beige/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <History size={16} />
          Sales History
        </button>
      </div>

      {loading && activeTab !== 'register-sale' ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-qasr-gold" size={32} />
        </div>
      ) : activeTab === 'products' ? (
        products.length === 0 ? (
          <div className="luxe-panel flex flex-col items-center py-16 text-center">
            <Package size={40} className="text-qasr-beige/30" />
            <p className="mt-4 text-lg text-white">No products yet</p>
            <p className="mt-1 text-sm text-qasr-beige/60">Add a product first to start stock tracking.</p>
          </div>
        ) : (
          <div className="luxe-panel overflow-hidden">
            {/* Header */}
            <div className="hidden grid-cols-[80px_1.5fr_1fr_100px_100px_130px_100px] gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.2em] text-qasr-beige/50 md:grid">
              <span>Photo</span>
              <span>Name</span>
              <span>Category</span>
              <span>Cost</span>
              <span>Price</span>
              <span>Stock Count</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
              {products.map((product) => {
                const cfg = statusConfig[product.status] || statusConfig.pending
                const StatusIcon = cfg.Icon
                const isEditingThis = editingStockId === product.id

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[80px_1.5fr_1fr_100px_100px_130px_100px] md:items-center md:gap-4 group hover:bg-white/[0.01] transition-colors"
                  >
                    {/* Image */}
                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package size={18} className="text-qasr-beige/30" />
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div>
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      <p className="text-xs text-qasr-beige/50 md:hidden">{product.category}</p>
                    </div>

                    {/* Category */}
                    <p className="hidden text-sm text-qasr-beige/70 md:block">{product.category}</p>

                    {/* Cost */}
                    <p className="text-sm text-qasr-beige/70">₹{product.total_cost?.toLocaleString('en-IN')}</p>

                    {/* Price */}
                    <p className="text-sm text-qasr-beige/70">
                      {product.selling_price > 0 ? `₹${product.selling_price.toLocaleString('en-IN')}` : '—'}
                    </p>

                    {/* Stock Count */}
                    <div className="flex items-center gap-2">
                      {isEditingThis ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            type="number"
                            min="0"
                            value={tempStock}
                            onChange={(e) => setTempStock(e.target.value)}
                            className="w-16 rounded-xl border border-white/10 bg-black/40 px-2 py-1 text-center text-xs text-white outline-none focus:border-qasr-gold"
                          />
                          <button
                            onClick={() => handleSaveStock(product.id)}
                            disabled={stockUpdating}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            disabled={stockUpdating}
                            className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-qasr-beige/60 transition hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${product.stock <= 5 ? 'text-red-400' : 'text-white'}`}>
                            {product.stock} items
                          </span>
                          {product.status === 'approved' && (
                            <button
                              onClick={() => {
                                setEditingStockId(product.id)
                                setTempStock(product.stock)
                              }}
                              className="rounded-full border border-white/10 bg-white/5 p-1.5 text-qasr-beige/50 hover:bg-white/10 hover:text-qasr-gold transition opacity-0 group-hover:opacity-100"
                              title="Update Stock"
                            >
                              <Edit3 size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      <StatusIcon size={12} />
                      {cfg.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      ) : activeTab === 'register-sale' ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sale Registry Form */}
          <div className="luxe-panel p-6 lg:col-span-1 h-fit">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-qasr-gold/10 p-2.5 text-qasr-gold">
                <ShoppingCart size={20} />
              </div>
              <h2 className="font-display text-xl text-white">Register a Sale</h2>
            </div>

            {approvedProducts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-qasr-beige/65">No approved products available.</p>
                <p className="text-xs text-qasr-beige/45 mt-1">Wait for the manager to approve products first.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSale} className="space-y-4">
                <div>
                  <label className="text-xs text-qasr-beige/65 block mb-2">Select Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white outline-none focus:border-qasr-gold/60 [&>option]:bg-qasr-night [&>option]:text-white"
                  >
                    <option value="">-- Choose Product --</option>
                    {approvedProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProductId && (
                  <div className="rounded-xl bg-white/5 p-3 text-xs space-y-1.5 border border-white/5">
                    <p className="text-qasr-beige/50">Base Material Cost: <span className="text-white">₹{products.find((p) => p.id === selectedProductId)?.total_cost.toLocaleString('en-IN')}</span></p>
                    <p className="text-qasr-beige/50">Standard Selling Price: <span className="text-qasr-gold font-medium">₹{products.find((p) => p.id === selectedProductId)?.selling_price.toLocaleString('en-IN')}</span></p>
                    <p className="text-qasr-beige/50">Available Stock: <span className={`font-semibold ${products.find((p) => p.id === selectedProductId)?.stock <= 5 ? 'text-red-400' : 'text-emerald-400'}`}>{products.find((p) => p.id === selectedProductId)?.stock} items</span></p>
                  </div>
                )}

                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <label className="text-xs text-qasr-beige/65 block mb-2">Quantity Sold</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={saleQuantity}
                      onChange={(e) => setSaleQuantity(parseInt(e.target.value) || 1)}
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-qasr-gold/60"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-qasr-beige/65 block mb-2">Unit Price Sold (₹)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-qasr-gold/60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saleLoading}
                  className="gold-button w-full mt-2"
                >
                  {saleLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Sale Request'
                  )}
                </button>
              </form>
            )}

            {/* Error/Success Feedbacks */}
            {saleError && (
              <div className="mt-4 flex gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
                <XCircle size={16} className="shrink-0 text-red-400" />
                <p>{saleError}</p>
              </div>
            )}
            {saleSuccess && (
              <div className="mt-4 flex gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
                <CheckCircle size={16} className="shrink-0 text-emerald-400" />
                <p>{saleSuccess}</p>
              </div>
            )}
          </div>

          {/* Form Explanation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="luxe-panel p-6">
              <h3 className="font-display text-lg text-white mb-3">Custom Prices and Workflows</h3>
              <p className="text-sm leading-7 text-qasr-beige/70">
                When registering a sale, you can customize the final sold price. This allows you to give special discounts to clients. 
              </p>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 flex gap-3 text-xs text-qasr-gold/90">
                <Clock size={18} className="shrink-0" />
                <p>
                  <strong>Note:</strong> Submitted sales are sent immediately to the Manager for verification. Stock count is decremented automatically only after the Manager approves the sale.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sales History Tab */
        sales.length === 0 ? (
          <div className="luxe-panel flex flex-col items-center py-16 text-center">
            <History size={40} className="text-qasr-beige/30" />
            <p className="mt-4 text-lg text-white">No sales registered yet</p>
            <p className="mt-1 text-sm text-qasr-beige/60">Registered sales history will appear here.</p>
          </div>
        ) : (
          <div className="luxe-panel overflow-hidden">
            {/* Header */}
            <div className="hidden grid-cols-[1.5fr_100px_100px_100px_120px_100px] gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.2em] text-qasr-beige/50 md:grid">
              <span>Product</span>
              <span>Qty Sold</span>
              <span>Unit Price</span>
              <span>Total Price</span>
              <span>Registered Date</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
              {sales.map((sale) => {
                const cfg = statusConfig[sale.status] || statusConfig.pending
                const StatusIcon = cfg.Icon

                return (
                  <div
                    key={sale.id}
                    className="grid grid-cols-1 gap-2 px-6 py-4 md:grid-cols-[1.5fr_100px_100px_100px_120px_100px] md:items-center md:gap-4 hover:bg-white/[0.01] transition-colors"
                  >
                    {/* Product Name */}
                    <div>
                      <p className="text-sm font-medium text-white">{sale.product_name}</p>
                      <p className="text-xs text-qasr-beige/50 md:hidden">{sale.product_category}</p>
                    </div>

                    {/* Qty */}
                    <p className="text-sm text-qasr-beige/70">
                      <span className="md:hidden text-xs text-qasr-beige/40 block mb-0.5">Quantity</span>
                      {sale.quantity} items
                    </p>

                    {/* Unit Price */}
                    <p className="text-sm text-qasr-beige/70">
                      <span className="md:hidden text-xs text-qasr-beige/40 block mb-0.5">Unit Price</span>
                      ₹{sale.sold_price.toLocaleString('en-IN')}
                    </p>

                    {/* Total Price */}
                    <p className="text-sm font-medium text-qasr-gold">
                      <span className="md:hidden text-xs text-qasr-beige/40 block mb-0.5">Total Value</span>
                      ₹{(sale.sold_price * sale.quantity).toLocaleString('en-IN')}
                    </p>

                    {/* Date */}
                    <p className="text-sm text-qasr-beige/60">
                      <span className="md:hidden text-xs text-qasr-beige/40 block mb-0.5">Date</span>
                      {new Date(sale.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>

                    {/* Status */}
                    <div className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      <StatusIcon size={12} />
                      {cfg.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}
    </section>
  )
}
