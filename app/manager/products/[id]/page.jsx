'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ChevronLeft, Save } from 'lucide-react'
import Link from 'next/link'
import ImageSlider from '../../../../components/ImageSlider'

export default function ManagerProductDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sizes, setSizes] = useState([])

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product)
          setName(data.product.name)
          setDescription(data.product.description || '')
          setSizes(JSON.parse(JSON.stringify(data.product.sizes))) // deep copy
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  function handleSizeChange(index, field, value) {
    const newSizes = [...sizes]
    newSizes[index][field] = value
    setSizes(newSizes)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          sizes: sizes.map(s => ({
            id: s.id,
            final_price: Number(s.final_price),
            stock: Number(s.stock)
          }))
        })
      })
      if (res.ok) {
        alert('Product updated successfully!')
        router.push('/manager/products')
      } else {
        alert('Failed to update product')
      }
    } catch {
      alert('Error updating product')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-qasr-gold" size={32} />
      </div>
    )
  }

  if (!product) {
    return <div className="text-center py-16 text-white">Product not found.</div>
  }

  const isMaterial = product.category_name === 'Boards' || product.category_name === 'Aluminium'

  return (
    <section className="space-y-6 max-w-4xl">
      <Link href="/manager/products" className="inline-flex items-center gap-2 text-sm text-qasr-beige/60 hover:text-white transition">
        <ChevronLeft size={16} /> Back to Catalog
      </Link>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 bg-black/30">
             <ImageSlider images={product.image_urls || []} alt={product.name} />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-qasr-gold text-center">{product.category_name}</p>
        </div>

        <div className="flex-1 space-y-6">
          <div className="luxe-panel p-6 space-y-4">
            <h2 className="text-xl font-display text-white border-b border-white/10 pb-4">Basic Info</h2>
            <div>
              <label className="block text-xs text-qasr-beige/50 mb-1">Product Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-qasr-gold/50"
              />
            </div>
            <div>
              <label className="block text-xs text-qasr-beige/50 mb-1">Description</label>
              <textarea 
                rows={4}
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-qasr-gold/50"
              />
            </div>
          </div>

          <div className="luxe-panel p-6 space-y-4">
            <h2 className="text-xl font-display text-white border-b border-white/10 pb-4">Size & Pricing Variants</h2>
            <div className="space-y-4">
              {sizes.map((s, idx) => (
                <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{s.size}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-[10px] text-qasr-beige/50 mb-1">Final Price (₹)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={s.final_price} 
                        onChange={e => handleSizeChange(idx, 'final_price', e.target.value)}
                        className="w-24 rounded border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-white outline-none focus:border-qasr-gold/50"
                      />
                    </div>
                    {!isMaterial && (
                      <div>
                        <label className="block text-[10px] text-qasr-beige/50 mb-1">Stock</label>
                        <input 
                          type="number" 
                          min="0"
                          value={s.stock} 
                          onChange={e => handleSizeChange(idx, 'stock', e.target.value)}
                          className="w-24 rounded border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-white outline-none focus:border-qasr-gold/50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="gold-button inline-flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
