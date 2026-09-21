import { createClient } from '@supabase/supabase-js'

const rawProjectUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const projectUrl = rawProjectUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
const restUrl = projectUrl ? `${projectUrl}/rest/v1` : ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getHeaders(isServer = false) {
  const key = isServer && serviceRoleKey ? serviceRoleKey : anonKey
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Prefer: 'return=representation',
  }
}

export function getServiceRoleClient() {
  if (!projectUrl || !serviceRoleKey) {
    throw new Error('Supabase project URL or service role key is missing')
  }
  return createClient(projectUrl, serviceRoleKey)
}

function parseJsonArray(value, fallback = []) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : fallback
    } catch {
      return value.split(',').map((i) => i.trim()).filter(Boolean)
    }
  }
  return fallback
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories() {
  if (!restUrl || !anonKey) return []

  try {
    const res = await fetch(
      `${restUrl}/categories?select=*&order=name.asc`,
      { headers: getHeaders(), cache: 'no-store' }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('[Supabase] Failed to fetch categories:', error)
    return []
  }
}

export async function createCategory(name) {
  if (!restUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  const res = await fetch(`${restUrl}/categories`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ name }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const msg = await res.text()
    if (msg.includes('duplicate') || msg.includes('unique')) {
      throw new Error('Category already exists')
    }
    throw new Error(msg || 'Failed to create category')
  }

  const data = await res.json()
  return Array.isArray(data) ? data[0] : data
}

// ============================================================
// PRODUCTS
// ============================================================

function normalizeProduct(record) {
  return {
    id: record.id,
    name: record.name,
    category_id: record.category_id,
    category_name: record.categories?.name || '',
    description: record.description || '',
    image_urls: parseJsonArray(record.image_urls),
    status: record.status || 'pending',
    created_by: record.created_by || null,
    approved_by: record.approved_by || null,
    created_at: record.created_at,
    updated_at: record.updated_at,
    sizes: Array.isArray(record.product_sizes)
      ? record.product_sizes.map((s) => ({
          id: s.id,
          size: s.size,
          price: Number(s.price) || 0,
          final_price: Number(s.final_price) || 0,
          stock: Number(s.stock) || 0,
        }))
      : [],
  }
}

// Fetch approved products with their sizes (for public homepage)
export async function getApprovedProducts() {
  if (!restUrl || !anonKey) return []

  try {
    const res = await fetch(
      `${restUrl}/products?status=eq.approved&select=*,categories(name),product_sizes(*)&order=created_at.desc`,
      { headers: getHeaders(true), cache: 'no-store' }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data.map(normalizeProduct) : []
  } catch (error) {
    console.error('[Supabase] Failed to fetch approved products:', error)
    return []
  }
}

// Fetch all products with sizes (for admin/manager dashboards)
export async function getAllProducts() {
  if (!restUrl || !serviceRoleKey) return []

  try {
    const res = await fetch(
      `${restUrl}/products?select=*,categories(name),product_sizes(*)&order=created_at.desc`,
      { headers: getHeaders(true), cache: 'no-store' }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data.map(normalizeProduct) : []
  } catch (error) {
    console.error('[Supabase] Failed to fetch all products:', error)
    return []
  }
}

// Fetch a single product by ID with sizes
export async function getProductById(id) {
  if (!restUrl || !anonKey || !id) return null

  try {
    const res = await fetch(
      `${restUrl}/products?id=eq.${id}&select=*,categories(name),product_sizes(*)`,
      { headers: getHeaders(true), cache: 'no-store' }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    return normalizeProduct(data[0])
  } catch (error) {
    console.error('[Supabase] Failed to fetch product by id:', error)
    return null
  }
}

// Create a new product with sizes (admin submits)
export async function createProduct(payload) {
  if (!restUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  // Step 1: Insert the product
  const productRes = await fetch(`${restUrl}/products`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({
      name: payload.name,
      category_id: payload.category_id,
      description: payload.description || '',
      image_urls: JSON.stringify(payload.image_urls || []),
      status: 'pending',
      created_by: payload.created_by || null,
    }),
    cache: 'no-store',
  })

  if (!productRes.ok) {
    const msg = await productRes.text()
    throw new Error(msg || 'Failed to create product')
  }

  const productData = await productRes.json()
  const product = Array.isArray(productData) ? productData[0] : productData

  // Step 2: Insert sizes
  if (payload.sizes && payload.sizes.length > 0) {
    const sizesPayload = payload.sizes.map((s) => ({
      product_id: product.id,
      size: s.size,
      price: Number(s.price) || 0,
      stock: Number(s.stock) || 0,
      final_price: 0,
    }))

    const sizesRes = await fetch(`${restUrl}/product_sizes`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(sizesPayload),
      cache: 'no-store',
    })

    if (!sizesRes.ok) {
      const msg = await sizesRes.text()
      console.error('[Supabase] Failed to insert sizes:', msg)
    }
  }

  return { success: true, product }
}

// Approve product — manager sets final_price per size
export async function approveProduct(id, sizePrices, approvedBy) {
  if (!restUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  // Step 1: Update product status
  const res = await fetch(`${restUrl}/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({
      status: 'approved',
      approved_by: approvedBy || null,
      updated_at: new Date().toISOString(),
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Failed to approve product')
  }

  // Step 2: Update final_price for each size
  if (sizePrices && Array.isArray(sizePrices)) {
    for (const sp of sizePrices) {
      if (!sp.id || sp.final_price === undefined) continue

      const sizeRes = await fetch(`${restUrl}/product_sizes?id=eq.${sp.id}`, {
        method: 'PATCH',
        headers: getHeaders(true),
        body: JSON.stringify({ final_price: Number(sp.final_price) }),
        cache: 'no-store',
      })

      if (!sizeRes.ok) {
        console.error(`[Supabase] Failed to update size ${sp.id}`)
      }
    }
  }

  return { success: true }
}

// Delete product
export async function deleteProduct(id) {
  if (!restUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  const res = await fetch(`${restUrl}/products?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
    cache: 'no-store',
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Failed to delete product')
  }

  return { success: true }
}

// Reject product
export async function rejectProduct(id) {
  if (!restUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  const res = await fetch(`${restUrl}/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({
      status: 'rejected',
      updated_at: new Date().toISOString(),
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Failed to reject product')
  }

  return { success: true }
}

// ============================================================
// CONTACT MESSAGES
// ============================================================

export async function createContactLead(payload) {
  if (!restUrl || !serviceRoleKey) {
    return { success: true, source: 'local', payload }
  }

  const res = await fetch(`${restUrl}/contact_messages`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Failed to create contact lead')
  }

  return { success: true, source: 'supabase' }
}

// ============================================================
// ADMIN USER MANAGEMENT
// ============================================================

export async function getAdmins() {
  if (!restUrl || !serviceRoleKey) return []

  const res = await fetch(
    `${restUrl}/users?role=eq.admin&select=*&order=created_at.desc`,
    { headers: getHeaders(true), cache: 'no-store' }
  )

  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function createAdminUser(email, password) {
  if (!projectUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  const res = await fetch(`${projectUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const msg = errorData.msg || errorData.error_description || 'Failed to create admin user'
    throw new Error(msg)
  }

  return { success: true }
}

export async function deleteAdminUser(id) {
  if (!projectUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  const res = await fetch(`${projectUrl}/auth/v1/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Failed to delete admin user')
  }

  return { success: true }
}
