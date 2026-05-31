'use client'

import { useState } from 'react'
import { Upload, X, Loader2, CheckCircle, Package, Layers, Wrench } from 'lucide-react'

const categories = ['Cupboard', 'Table', 'Door', 'Window', 'Partition', 'Arabic Majlis', 'Other']

export default function AdminAddProduct() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)

  const [boardDetails, setBoardDetails] = useState('')
  const [boardSize, setBoardSize] = useState('')
  const [boardCost, setBoardCost] = useState('')
  const [glassDetails, setGlassDetails] = useState('')
  const [glassSize, setGlassSize] = useState('')
  const [glassCost, setGlassCost] = useState('')
  const [aluminumDetails, setAluminumDetails] = useState('')
  const [aluminumCost, setAluminumCost] = useState('')
  const [otherCost, setOtherCost] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const totalCost =
    (Number(boardCost) || 0) +
    (Number(glassCost) || 0) +
    (Number(aluminumCost) || 0) +
    (Number(otherCost) || 0)

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    setError('')

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (res.ok && data.url) {
          setImages((prev) => [...prev, data.url])
        } else {
          setError(data.message || 'Failed to upload image')
        }
      } catch {
        setError('Failed to upload image')
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)

    if (!name.trim() || !category) {
      setError('Product name and category are required.')
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          images,
          board_details: boardDetails,
          board_size: boardSize,
          board_cost: Number(boardCost) || 0,
          glass_details: glassDetails,
          glass_size: glassSize,
          glass_cost: Number(glassCost) || 0,
          aluminum_details: aluminumDetails,
          aluminum_cost: Number(aluminumCost) || 0,
          other_cost: Number(otherCost) || 0,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setName('')
        setCategory('')
        setDescription('')
        setImages([])
        setBoardDetails('')
        setBoardSize('')
        setBoardCost('')
        setGlassDetails('')
        setGlassSize('')
        setGlassCost('')
        setAluminumDetails('')
        setAluminumCost('')
        setOtherCost('')
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to create product')
      }
    } catch {
      setError('Something went wrong.')
    }

    setSubmitting(false)
  }

  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-qasr-beige/50 focus:border-qasr-gold/60 transition'

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Add Product</p>
        <h1 className="mt-3 font-display text-4xl text-white">Create a New Product</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
          Add product details, upload photos, and specify material costs. The manager will review and set the final price.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
          <CheckCircle size={20} className="text-emerald-400" />
          <p className="text-sm text-emerald-300">Product sent for manager approval!</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="luxe-panel p-6">
          <div className="mb-5 flex items-center gap-2 text-qasr-gold">
            <Package size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Product Info</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Product name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select
              className={`${inputClass} ${!category ? 'text-qasr-beige/50' : ''}`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>Select category *</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-qasr-night">{cat}</option>
              ))}
            </select>
            <textarea
              className={`${inputClass} min-h-24 md:col-span-2`}
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="luxe-panel p-6">
          <div className="mb-5 flex items-center gap-2 text-qasr-gold">
            <Upload size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Photos</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((url, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1 opacity-0 transition group-hover:opacity-100"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ))}

            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 text-qasr-beige/50 transition hover:border-qasr-gold/40 hover:text-qasr-gold">
              {uploading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <Upload size={24} />
                  <span className="text-xs">Upload</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Materials */}
        <div className="luxe-panel p-6">
          <div className="mb-5 flex items-center gap-2 text-qasr-gold">
            <Layers size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Materials & Costs</h2>
          </div>

          <div className="space-y-5">
            {/* Board */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-qasr-beige/60">
                🪵 Board
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <input className={inputClass} placeholder="Board details" value={boardDetails} onChange={(e) => setBoardDetails(e.target.value)} />
                <input className={inputClass} placeholder="Size (e.g. 8×4 feet)" value={boardSize} onChange={(e) => setBoardSize(e.target.value)} />
                <input className={inputClass} type="number" min="0" placeholder="Cost (₹)" value={boardCost} onChange={(e) => setBoardCost(e.target.value)} />
              </div>
            </div>

            {/* Glass */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-qasr-beige/60">
                🪟 Glass
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <input className={inputClass} placeholder="Glass details" value={glassDetails} onChange={(e) => setGlassDetails(e.target.value)} />
                <input className={inputClass} placeholder="Size (e.g. 4×3 feet)" value={glassSize} onChange={(e) => setGlassSize(e.target.value)} />
                <input className={inputClass} type="number" min="0" placeholder="Cost (₹)" value={glassCost} onChange={(e) => setGlassCost(e.target.value)} />
              </div>
            </div>

            {/* Aluminum */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-qasr-beige/60">
                🔩 Aluminum Fitting
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <input className={inputClass} placeholder="Aluminum details" value={aluminumDetails} onChange={(e) => setAluminumDetails(e.target.value)} />
                <input className={inputClass} type="number" min="0" placeholder="Cost (₹)" value={aluminumCost} onChange={(e) => setAluminumCost(e.target.value)} />
              </div>
            </div>

            {/* Other */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-qasr-beige/60">
                📦 Other Costs
              </p>
              <input className={`${inputClass} md:w-1/3`} type="number" min="0" placeholder="Other cost (₹)" value={otherCost} onChange={(e) => setOtherCost(e.target.value)} />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between rounded-2xl border border-qasr-gold/20 bg-qasr-gold/5 px-5 py-4">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-qasr-gold">Total Material Cost</span>
              <span className="font-display text-2xl text-white">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="gold-button w-full disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} /> Submitting...
            </span>
          ) : (
            'Submit for Approval'
          )}
        </button>
      </form>
    </section>
  )
}
