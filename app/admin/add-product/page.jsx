'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Loader2, CheckCircle, Package, Plus, Minus } from 'lucide-react'

export default function AdminAddProduct() {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)

  // Categories
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [newCategory, setNewCategory] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)

  // Size variants
  const [sizes, setSizes] = useState([{ size: '', price: '', stock: '' }])

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoadingCategories(false))
  }, [])

  // Add a new category
  async function handleAddCategory() {
    if (!newCategory.trim()) return
    setAddingCategory(true)

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        const cat = data.category
        setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
        setCategoryId(cat.id)
        setNewCategory('')
        setShowAddCategory(false)
      } else {
        setError(data.message || 'Failed to add category')
      }
    } catch {
      setError('Failed to add category')
    }

    setAddingCategory(false)
  }

  // Size management
  function addSize() {
    setSizes((prev) => [...prev, { size: '', price: '', stock: '' }])
  }

  function removeSize(index) {
    if (sizes.length <= 1) return
    setSizes((prev) => prev.filter((_, i) => i !== index))
  }

  function updateSize(index, field, value) {
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  // Image upload
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

  // Submit product
  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)

    if (!name.trim() || !categoryId) {
      setError('Product name and category are required.')
      setSubmitting(false)
      return
    }

    // Validate sizes
    const validSizes = sizes.filter((s) => s.size.trim() && s.price)
    if (validSizes.length === 0) {
      setError('At least one size with a price is required.')
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category_id: categoryId,
          description: description.trim(),
          image_urls: images,
          sizes: validSizes.map((s) => ({
            size: s.size.trim(),
            price: Number(s.price) || 0,
            stock: isNoStock ? 0 : (Number(s.stock) || 0),
          })),
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setName('')
        setCategoryId('')
        setDescription('')
        setImages([])
        setSizes([{ size: '', price: '', stock: '' }])
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to create product')
      }
    } catch {
      setError('Something went wrong.')
    }

    setSubmitting(false)
  }

  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name || ''
  const isNoStock = selectedCategoryName === 'Boards' || selectedCategoryName === 'Aluminium'

  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-qasr-beige/50 focus:border-qasr-gold/60 transition'

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Add Product</p>
        <h1 className="mt-3 font-display text-4xl text-white">Create a New Product</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
          Add product details, upload photos, and specify available sizes with prices. The manager
          will review and set the final price.
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

            <div className="flex gap-2">
              {showAddCategory ? (
                <div className="flex flex-1 gap-2">
                  <input
                    className={inputClass}
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={addingCategory}
                    className="shrink-0 rounded-2xl bg-qasr-gold px-4 py-3 text-xs font-semibold text-qasr-night transition hover:bg-[#e2b877] disabled:opacity-50"
                  >
                    {addingCategory ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="shrink-0 rounded-2xl border border-white/10 px-3 py-3 text-xs text-qasr-beige/60 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex flex-1 gap-2">
                  <select
                    className={`flex-1 ${inputClass} ${!categoryId ? 'text-qasr-beige/50' : ''}`}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    disabled={loadingCategories}
                  >
                    <option value="" disabled>
                      {loadingCategories ? 'Loading categories...' : 'Select category *'}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-qasr-night">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(true)}
                    className="shrink-0 rounded-2xl border border-dashed border-qasr-gold/40 px-3 py-3 text-xs text-qasr-gold transition hover:border-qasr-gold hover:bg-qasr-gold/10"
                    title="Add new category"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>

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
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10"
              >
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

        {/* Size Variants */}
        <div className="luxe-panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-qasr-gold">
              <Package size={18} />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
                Available Sizes & Pricing
              </h2>
            </div>
            <button
              type="button"
              onClick={addSize}
              className="flex items-center gap-1.5 rounded-xl border border-qasr-gold/30 bg-qasr-gold/10 px-3 py-1.5 text-xs font-medium text-qasr-gold transition hover:bg-qasr-gold/20"
            >
              <Plus size={14} />
              Add Size
            </button>
          </div>

          <div className="space-y-3">
            {sizes.map((sizeItem, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/8 bg-white/3 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-qasr-beige/60">
                    Size Variant {index + 1}
                  </p>
                  {sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="rounded-lg border border-red-500/20 p-1 text-red-400/60 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Minus size={14} />
                    </button>
                  )}
                </div>
                <div className={`grid gap-3 ${isNoStock ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                  <input
                    className={inputClass}
                    placeholder="Size (e.g. 6×4 ft, Large, Standard) *"
                    value={sizeItem.size}
                    onChange={(e) => updateSize(index, 'size', e.target.value)}
                    required
                  />
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    placeholder="Price (₹) *"
                    value={sizeItem.price}
                    onChange={(e) => updateSize(index, 'price', e.target.value)}
                    required
                  />
                  {!isNoStock && (
                    <input
                      className={inputClass}
                      type="number"
                      min="0"
                      placeholder="Stock quantity"
                      value={sizeItem.stock}
                      onChange={(e) => updateSize(index, 'stock', e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}
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
