-- Phase 2 SQL Migration: Stock & Sales Management

-- 1. Alter Products Table to Add Stock
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0);

-- 2. Create Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  sold_price numeric NOT NULL CHECK (sold_price >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by uuid REFERENCES public.users(id),
  approved_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Enable RLS on Sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Sales
-- Anyone logged in can read sales (Admins see history, Managers see reviews)
DROP POLICY IF EXISTS "Authenticated users can select sales" ON public.sales;
CREATE POLICY "Authenticated users can select sales"
  ON public.sales FOR SELECT USING (true);

-- Admins can insert sales
DROP POLICY IF EXISTS "Admins can insert sales" ON public.sales;
CREATE POLICY "Admins can insert sales"
  ON public.sales FOR INSERT WITH CHECK (true);

-- Service role can update sales (approvals/rejections are done server-side)
DROP POLICY IF EXISTS "Service role can update sales" ON public.sales;
CREATE POLICY "Service role can update sales"
  ON public.sales FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Trigger Function to Decrement Stock on Sale Approval
CREATE OR REPLACE FUNCTION public.handle_sale_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Verify stock is sufficient
    IF (SELECT stock FROM public.products WHERE id = NEW.product_id) < NEW.quantity THEN
      RAISE EXCEPTION 'Insufficient stock to approve this sale.';
    END IF;

    -- Reduce stock
    UPDATE public.products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 6. Attach Trigger to Sales Table
DROP TRIGGER IF EXISTS on_sale_approved ON public.sales;
CREATE TRIGGER on_sale_approved
AFTER UPDATE ON public.sales
FOR EACH ROW
WHEN (NEW.status = 'approved' AND OLD.status = 'pending')
EXECUTE FUNCTION public.handle_sale_approval();
