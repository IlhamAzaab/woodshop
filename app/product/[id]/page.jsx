import { notFound } from 'next/navigation'
import { getProductById } from '../../../lib/supabase'
import ImageSlider from '../../../components/ImageSlider'
import Link from 'next/link'
import { ChevronLeft, Package } from 'lucide-react'

export default async function ProductDetailsPage({ params }) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  const sizes = product.sizes || []
  
  return (
    <main className="pb-20 pt-10">
      <div className="wrapper max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-qasr-beige/60 transition hover:text-white"
        >
          <ChevronLeft size={16} />
          Back to Home
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-black/30 border border-white/10">
            <ImageSlider images={product.image_urls || []} alt={product.name} />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-qasr-gold">
                {product.category_name}
              </p>
              <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
                {product.name}
              </h1>
            </div>

            {product.description && (
              <p className="text-base leading-8 text-qasr-beige/80">
                {product.description}
              </p>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
                Available Sizes
              </h3>
              
              {sizes.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {sizes.map((s) => {
                    const price = product.status === 'approved' ? s.final_price : s.price
                    return (
                      <div
                        key={s.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                      >
                        <p className="font-medium text-white">{s.size}</p>
                        {price > 0 ? (
                          <p className="mt-1 text-lg text-qasr-gold">
                            ₹{price.toLocaleString('en-IN')}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-qasr-beige/50">Price pending</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-qasr-beige/50">
                  <Package size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No size information available.</p>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <Link href="/contact" className="gold-button inline-flex w-full justify-center md:w-auto">
                Inquire About This Piece
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
