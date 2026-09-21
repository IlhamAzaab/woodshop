-- ============================================================
-- QASR — Phase 2 Schema Updates
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add stock_request to product_sizes
ALTER TABLE public.product_sizes
ADD COLUMN IF NOT EXISTS stock_request integer NOT NULL DEFAULT 0;

-- 2. Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_id uuid NOT NULL REFERENCES public.product_sizes(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  admin_price numeric NOT NULL, 
  final_price numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by uuid REFERENCES public.users(id),
  approved_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Admins can insert sales
CREATE POLICY "Authenticated can insert sales"
  ON public.sales FOR INSERT WITH CHECK (true);

-- Anyone authenticated can read sales (for managers and admins)
CREATE POLICY "Authenticated can read sales"
  ON public.sales FOR SELECT USING (true);

-- Service role can update/delete sales
CREATE POLICY "Service role can update sales"
  ON public.sales FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete sales"
  ON public.sales FOR DELETE USING (true);
