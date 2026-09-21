import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload an image buffer to Cloudinary.
 * Returns the secure public URL.
 */
export async function uploadImageToCloudinary(fileBuffer, fileName) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables are not configured.')
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'qasr-products',
        public_id: `${Date.now()}-${fileName.replace(/\.[^.]+$/, '')}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(new Error(error.message || 'Cloudinary upload failed'))
        } else {
          resolve(result.secure_url)
        }
      }
    )

    uploadStream.end(fileBuffer)
  })
}
