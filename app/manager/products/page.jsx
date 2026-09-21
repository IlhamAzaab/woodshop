'use client'

import { useEffect, useState } from 'react'
import { Package, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import ImageSlider from '../../../components/ImageSlider'

export default function ManagerProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  function fetchData() {
    setLoading(true)
    fetch('/api/products?all=true')
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const approvedProducts = products.filter((p) => p.status === 'approved')

  return (
    <section className="space-y-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Manager View</p>
          <h1 className="mt-3 font-display text-4xl text-white">Approved Products</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
            View all approved products in your catalog. To review new submissions, go to the Review page.
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
      ) : approvedProducts.length === 0 ? (
        <div className="luxe-panel flex flex-col items-center py-16 text-center">
          <Package size={40} className="text-qasr-beige/30" />
          <p className="mt-4 text-white">No approved products yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedProducts.map((product) => (
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
                  <Link href={`/manager/products/${product.id}`}>
                    <h3 className="text-lg font-medium text-white transition hover:text-qasr-gold">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-0.5 text-sm text-qasr-beige/60">{product.category_name}</p>
                  
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
                            <span className="text-qasr-gold">
                              ₹{s.final_price.toLocaleString('en-IN')}
                            </span>
                            {!isMaterial && (
                              <>
                                <span className="mx-1.5 text-qasr-beige/40">·</span>
                                <span className={s.stock <= 5 ? 'text-red-400' : 'text-qasr-beige/60'}>
                                  {s.stock} in stock
                                </span>
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
          ))}
        </div>
      )}
    </section>
  )
}
