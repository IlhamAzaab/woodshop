'use client'

import { useEffect, useState, useMemo } from 'react'
import { Package, Search, Loader2 } from 'lucide-react'

export default function AdminSales() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  
  // State for recording sales
  const [sellingFor, setSellingFor] = useState(null) // size_id
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/products?all=true')
      const data = await res.json()
      // Filter out raw materials and unapproved products
      const filtered = (data.products || []).filter(p => 
        p.category_name !== 'Boards' && 
        p.category_name !== 'Aluminium' &&
        p.status === 'approved'
      )
      setProducts(filtered)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category_name))
    return ['All', ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = categoryFilter === 'All' || p.category_name === categoryFilter
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [products, search, categoryFilter])

  async function handleSubmitSale(productId, sizeId) {
    const qty = parseInt(quantity, 10)
    const prc = parseFloat(price)

    if (!qty || qty <= 0) return alert('Quantity must be greater than 0')
    if (!prc || prc <= 0) return alert('Price must be greater than 0')

    setSubmitting(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, size_id: sizeId, quantity: qty, price: prc })
      })

      if (res.ok) {
        alert('Sale submitted for manager review!')
        setSellingFor(null)
        setQuantity('')
        setPrice('')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to submit sale')
      }
    } catch {
      alert('Error submitting sale')
    }
    setSubmitting(false)
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Store Operations</p>
        <h1 className="mt-3 font-display text-4xl text-white">Record Sales</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
          Log items sold manually in the store. Enter the quantity and actual selling price. 
          Sales will be sent to the Manager for final review and stock deduction.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-qasr-beige/50" size={18} />
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm text-white placeholder-qasr-beige/50 outline-none focus:border-qasr-gold/50"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-qasr-gold/50 md:w-48"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-qasr-gold" size={32} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="luxe-panel flex flex-col items-center py-16 text-center">
          <Package size={40} className="text-qasr-beige/30" />
          <p className="mt-4 text-white">No products found matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map(product => (
            <div key={product.id} className="luxe-panel p-5">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  {product.image_urls?.[0] ? (
                    <img src={product.image_urls[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package size={20} className="text-qasr-beige/30" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">{product.name}</h3>
                  <p className="text-xs text-qasr-beige/50">{product.category_name}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                {product.sizes.map(s => {
                  const isSelling = sellingFor === s.id
                  return (
                    <div key={s.id} className="rounded-xl border border-white/5 bg-white/5 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{s.size}</p>
                          <p className="text-xs text-qasr-beige/60">
                            Base: ₹{s.final_price} · Stock: {s.stock}
                          </p>
                        </div>
                        {!isSelling ? (
                          <button
                            onClick={() => {
                              setSellingFor(s.id)
                              setQuantity('1')
                              setPrice(s.final_price.toString())
                            }}
                            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/20"
                          >
                            Record Sale
                          </button>
                        ) : (
                          <button
                            onClick={() => setSellingFor(null)}
                            className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/20"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      {isSelling && (
                        <div className="mt-3 flex items-end gap-2 border-t border-white/10 pt-3">
                          <div className="flex-1">
                            <label className="mb-1 block text-[10px] text-qasr-beige/50">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              className="w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none focus:border-qasr-gold/50"
                            />
                          </div>
                          <div className="flex-[2]">
                            <label className="mb-1 block text-[10px] text-qasr-beige/50">Sell Price (₹)</label>
                            <input
                              type="number"
                              min="1"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              className="w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none focus:border-qasr-gold/50"
                            />
                          </div>
                          <button
                            onClick={() => handleSubmitSale(product.id, s.id)}
                            disabled={submitting}
                            className="rounded bg-qasr-gold px-3 py-1.5 text-xs font-medium text-black disabled:opacity-50"
                          >
                            {submitting ? '...' : 'Submit'}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
