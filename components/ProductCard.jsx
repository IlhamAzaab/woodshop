'use client'

import Image from 'next/image'

export default function ProductCard({ product }) {
  const hasImage = product.images && product.images.length > 0
  const imgSrc = hasImage ? product.images[0] : null

  return (
    <article className="luxe-panel overflow-hidden transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(208,161,91,0.15)]">
      <div className="relative h-60 overflow-hidden bg-black/30">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className="object-cover transition duration-500 hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-qasr-beige/30">
            <span className="text-4xl">📦</span>
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="font-display text-2xl text-white">{product.name}</h3>
          {product.selling_price > 0 && (
            <p className="mt-1 text-qasr-gold">₹{product.selling_price.toLocaleString('en-IN')}</p>
          )}
        </div>

        {product.description && (
          <p className="line-clamp-2 text-sm leading-7 text-qasr-beige/80">
            {product.description}
          </p>
        )}

        <p className="inline-block rounded-full bg-qasr-gold/10 px-3 py-1 text-xs text-qasr-gold">
          {product.category}
        </p>
      </div>
    </article>
  )
}
