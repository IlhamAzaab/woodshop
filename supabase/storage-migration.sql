-- QASR product-image storage
-- Run this once in the Supabase SQL Editor before uploading new images.
-- Existing Cloudinary URLs are intentionally not migrated.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'qasr-product-images',
  'qasr-product-images',
  true,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Product images are publicly readable through Supabase's CDN URL.
-- Uploads remain server-only through the service-role key.
DROP POLICY IF EXISTS "Public can view QASR product images" ON storage.objects;

CREATE POLICY "Public can view QASR product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'qasr-product-images');
