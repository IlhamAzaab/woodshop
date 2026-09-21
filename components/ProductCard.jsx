'use client'

import ImageSlider from './ImageSlider'
import Link from 'next/link'

export default function ProductCard({ product }) {
  const hasImage = product.image_urls && product.image_urls.length > 0

  // Calculate price range from sizes
  const sizes = product.sizes || []
  const prices = sizes.map((s) => s.final_price).filter((p) => p > 0)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

  return (
    <article className="luxe-panel overflow-hidden transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(208,161,91,0.15)]">
      <div className="relative h-60 overflow-hidden bg-black/30">
        <Link href={`/product/${product.id}`} className="absolute inset-0 z-10 block" />
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="pointer-events-auto h-full w-full">
            <ImageSlider images={product.image_urls || []} alt={product.name} />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-display text-2xl text-white transition hover:text-qasr-gold">
              {product.name}
            </h3>
          </Link>
          {minPrice > 0 && (
            <p className="mt-1 text-qasr-gold">
              ₹{minPrice.toLocaleString('en-IN')}
              {maxPrice > minPrice && ` — ₹${maxPrice.toLocaleString('en-IN')}`}
            </p>
          )}
        </div>

        {product.description && (
          <p className="line-clamp-2 text-sm leading-7 text-qasr-beige/80">
            {product.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <p className="inline-block rounded-full bg-qasr-gold/10 px-3 py-1 text-xs text-qasr-gold">
            {product.category_name}
          </p>
          {sizes.length > 0 && (
            <p className="inline-block rounded-full bg-white/5 px-3 py-1 text-xs text-qasr-beige/60">
              {sizes.length} size{sizes.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
