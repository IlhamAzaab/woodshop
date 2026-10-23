import 'server-only'

import { randomUUID } from 'node:crypto'
import { getServiceRoleClient } from './supabase'

export const PRODUCT_IMAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || 'qasr-product-images'

const IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

export const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024

/**
 * Upload one product image to Supabase Storage and return its public CDN URL.
 * The database continues to store only this URL in products.image_urls.
 */
export async function uploadProductImage(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new Error('A valid image file is required.')
  }

  const extension = IMAGE_TYPES[file.type]
  if (!extension) {
    throw new Error('Only JPG, PNG, WEBP, GIF, and AVIF images are supported.')
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error('Image must be 10 MB or smaller.')
  }

  const objectPath = `products/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const supabase = getServiceRoleClient()

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(objectPath, fileBuffer, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message || 'Supabase Storage upload failed.')
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(objectPath)

  if (!data?.publicUrl) {
    throw new Error('Supabase Storage did not return a public image URL.')
  }

  return data.publicUrl
}
