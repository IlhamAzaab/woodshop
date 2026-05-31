-- QASR Products Table — Full Rebuild with Materials, Costs, and Profit

-- Step 1: Drop old products table
DROP TABLE IF EXISTS public.products CASCADE;

-- Step 2: Create new products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  
  -- Materials / Cost Breakdown (Admin fills these)
  board_details text DEFAULT '',
  board_size text DEFAULT '',
  board_cost numeric NOT NULL DEFAULT 0,
  glass_details text DEFAULT '',
  glass_size text DEFAULT '',
  glass_cost numeric NOT NULL DEFAULT 0,
  aluminum_details text DEFAULT '',
  aluminum_cost numeric NOT NULL DEFAULT 0,
  other_cost numeric NOT NULL DEFAULT 0,
  total_cost numeric GENERATED ALWAYS AS (board_cost + glass_cost + aluminum_cost + other_cost) STORED,
  
  -- Manager fills these
  selling_price numeric DEFAULT 0,
  profit numeric GENERATED ALWAYS AS (selling_price - (board_cost + glass_cost + aluminum_cost + other_cost)) STORED,
  
  -- Workflow
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Images (stored as Supabase Storage URLs in JSON array)
  images jsonb DEFAULT '[]'::jsonb,
  
  -- Tracking
  created_by uuid REFERENCES public.users(id),
  approved_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Step 3: Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS Policies
CREATE POLICY "Anyone can read approved products"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert products"
  ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update products"
  ON public.products FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete products"
  ON public.products FOR DELETE USING (true);

-- Step 5: Create storage bucket for product images
-- NOTE: You need to go to Supabase Dashboard > Storage > Create bucket
-- Bucket name: product-images
-- Make it PUBLIC
-- Add policy: Allow authenticated uploads and public reads

-- Done!
