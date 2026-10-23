QASR Furniture Shop

Next.js furniture catalog and internal admin/manager operations portal.

Run `npm install` then `npm run dev` to start the app.

## Supabase product-image storage

Product images are stored in the public Supabase Storage bucket
`qasr-product-images`. The product database keeps only the returned public
Supabase CDN URLs in `products.image_urls`.

Before uploading new product images, run
[`supabase/storage-migration.sql`](supabase/storage-migration.sql) in the
Supabase SQL Editor. The server uses `SUPABASE_STORAGE_BUCKET` when present;
the default is `qasr-product-images`.

Cloudinary images are intentionally not migrated. New uploads start fresh in
Supabase Storage.
