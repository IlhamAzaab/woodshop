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

function normalizeProduct(record) {
  return {
    id: record.id,
    name: record.name,
    category: record.category || '',
    description: record.description || '',
    images: parseJsonArray(record.images),
    board_details: record.board_details || '',
    board_size: record.board_size || '',
    board_cost: Number(record.board_cost) || 0,
    glass_details: record.glass_details || '',
    glass_size: record.glass_size || '',
    glass_cost: Number(record.glass_cost) || 0,
    aluminum_details: record.aluminum_details || '',
    aluminum_cost: Number(record.aluminum_cost) || 0,
    other_cost: Number(record.other_cost) || 0,
    total_cost: Number(record.total_cost) || 0,
    selling_price: Number(record.selling_price) || 0,
    profit: Number(record.profit) || 0,
    status: record.status || 'pending',
    stock: Number(record.stock) || 0,
    created_by: record.created_by || null,
    approved_by: record.approved_by || null,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

// Fetch only approved products (for customer homepage)
export async function getApprovedProducts() {
  if (!restUrl || !anonKey) return []

  try {
    const res = await fetch(
      `${restUrl}/products?status=eq.approved&selling_price=gt.0&select=*&order=created_at.desc`,
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

// Fetch a single product by ID (for product detail page)
export async function getCatalogProductById(id) {
  if (!restUrl || !anonKey || !id) return null

  try {
    const res = await fetch(
      `${restUrl}/products?id=eq.${id}&select=*`,
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

// Fetch all products (for admin/manager dashboards)
export async function getAllProducts() {
  if (!restUrl || !serviceRoleKey) return []

  try {
    const res = await fetch(
      `${restUrl}/products?select=*&order=created_at.desc`,
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

// Fetch pending products (for manager review)
export async function getPendingProducts() {
  if (!restUrl || !serviceRoleKey) return []

  try {
    const res = await fetch(
      `${restUrl}/products?status=eq.pending&select=*&order=created_at.desc`,
      { headers: getHeaders(true), cache: 'no-store' }
    )

    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data.map(normalizeProduct) : []
  } catch (error) {
    console.error('[Supabase] Failed to fetch pending products:', error)
    return []
  }
}

// Create a new product (admin submits)
export async function createProduct(payload) {
  if (!restUrl || !serviceRoleKey) {
    throw new Error('Supabase not configured')
  }

  const res = await fetch(`${restUrl}/products`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({
      name: payload.name,
      category: payload.category,
      description: payload.description || '',
      images: JSON.stringify(payload.images || []),
      board_details: payload.board_details || '',
      board_size: payload.board_size || '',
      board_cost: Number(payload.board_cost) || 0,
      glass_details: payload.glass_details || '',
      glass_size: payload.glass_size || '',
      glass_cost: Number(payload.glass_cost) || 0,
      aluminum_details: payload.aluminum_details || '',
      aluminum_cost: Number(payload.aluminum_cost) || 0,
      other_cost: Number(payload.other_cost) || 0,
      status: 'pending',
      created_by: payload.created_by || null,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Failed to create product')
  }

  return { success: true }
}

// Approve product (manager sets price)
export async function approveProduct(id, sellingPrice, approvedBy) {
  if (!restUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  const res = await fetch(`${restUrl}/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({
      status: 'approved',
      selling_price: Number(sellingPrice),
      approved_by: approvedBy || null,
      updated_at: new Date().toISOString(),
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Failed to approve product')
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

// Upload image to Supabase Storage
export async function uploadImage(fileBuffer, fileName, contentType) {
  if (!projectUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  const storagePath = `products/${Date.now()}-${fileName}`
  const uploadUrl = `${projectUrl}/storage/v1/object/product-images/${storagePath}`

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': contentType || 'image/jpeg',
    },
    body: fileBuffer,
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Failed to upload image')
  }

  const publicUrl = `${projectUrl}/storage/v1/object/public/product-images/${storagePath}`
  return publicUrl
}

// Contact lead
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

// Fetch all admins
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

// Create admin user in Supabase Auth via Admin API
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
      user_metadata: {
        role: 'admin',
      },
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

// Delete admin user in Supabase Auth via Admin API
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

// Set/Update Product Stock
export async function updateProductStock(id, newStock) {
  if (!restUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  const patchUrl = `${restUrl}/products?id=eq.${id}`
  const patchBody = {
    stock: Number(newStock),
    updated_at: new Date().toISOString(),
  }

  console.log('[STOCK] Patching:', patchUrl, JSON.stringify(patchBody))

  const res = await fetch(patchUrl, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(patchBody),
    cache: 'no-store',
  })

  if (!res.ok) {
    const msg = await res.text()
    console.error('[STOCK] Supabase error:', res.status, msg)
    throw new Error(msg || 'Failed to update stock')
  }

  return { success: true }
}

// Format and Normalize Sales Records
function normalizeSale(record) {
  return {
    id: record.id,
    product_id: record.product_id,
    product_name: record.products?.name || 'Unknown Product',
    product_category: record.products?.category || '',
    product_selling_price: Number(record.products?.selling_price) || 0,
    product_total_cost: Number(record.products?.total_cost) || 0,
    quantity: Number(record.quantity) || 0,
    sold_price: Number(record.sold_price) || 0,
    status: record.status || 'pending',
    created_by: record.created_by,
    approved_by: record.approved_by,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

// Fetch all sales, optionally filtered by user ID (Admin sees their own)
export async function getSales(createdBy = null) {
  if (!restUrl || !serviceRoleKey) return []

  let url = `${restUrl}/sales?select=*,products(name,category,selling_price,total_cost)&order=created_at.desc`
  if (createdBy) {
    url += `&created_by=eq.${createdBy}`
  }

  const res = await fetch(url, {
    headers: getHeaders(true),
    cache: 'no-store',
  })

  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data.map(normalizeSale) : []
}

// Create pending sale record (Admin submits)
export async function createSale(payload) {
  if (!restUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  const res = await fetch(`${restUrl}/sales`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({
      product_id: payload.product_id,
      quantity: Number(payload.quantity),
      sold_price: Number(payload.sold_price),
      status: 'pending',
      created_by: payload.created_by || null,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Failed to record sale')
  }

  return { success: true }
}

// Approve sale transaction (Manager accepts)
export async function approveSale(id, approvedBy) {
  if (!restUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  const res = await fetch(`${restUrl}/sales?id=eq.${id}`, {
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
    const errorData = await res.json().catch(() => ({}))
    const msg = errorData.message || errorData.details || 'Failed to approve sale'
    throw new Error(msg)
  }

  return { success: true }
}

// Reject sale transaction (Manager declines)
export async function rejectSale(id) {
  if (!restUrl || !serviceRoleKey) throw new Error('Supabase not configured')

  const res = await fetch(`${restUrl}/sales?id=eq.${id}`, {
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
    throw new Error(msg || 'Failed to reject sale')
  }

  return { success: true }
}
