-- ============================================================
-- QASR — Full Database Schema (Consolidated)
-- Run this in Supabase SQL Editor in a new project
-- ============================================================
UPDATE public.users 
SET role = 'manager' 
WHERE email = 'manager1@gmail.com';

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create user profile on auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = excluded.email,
        role = excluded.role;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users (role);

CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'manager'
  );
$$;

CREATE POLICY "Managers can read all users"
  ON public.users FOR SELECT
  USING (public.is_manager());

CREATE POLICY "Managers can insert users"
  ON public.users FOR INSERT
  WITH CHECK (public.is_manager());

CREATE POLICY "Managers can update users"
  ON public.users FOR UPDATE
  USING (public.is_manager());

CREATE POLICY "Managers can delete users"
  ON public.users FOR DELETE
  USING (public.is_manager());

-- ============================================================
-- 2. CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read categories
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT USING (true);

-- Authenticated users can insert categories
CREATE POLICY "Authenticated can insert categories"
  ON public.categories FOR INSERT WITH CHECK (true);

-- Service role can update/delete categories
CREATE POLICY "Service role can update categories"
  ON public.categories FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete categories"
  ON public.categories FOR DELETE USING (true);

-- Seed default categories
INSERT INTO public.categories (name) VALUES
  ('Cupboard'),
  ('Chair'),
  ('Table'),
  ('Window'),
  ('Bed'),
  ('Boards'),
  ('Aluminium'),
  ('Door'),
  ('Partition'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 3. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  description text DEFAULT '',
  image_urls jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by uuid REFERENCES public.users(id),
  approved_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert products"
  ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update products"
  ON public.products FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete products"
  ON public.products FOR DELETE USING (true);

-- ============================================================
-- 4. PRODUCT SIZES TABLE (one-to-many with products)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  final_price numeric DEFAULT 0,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_request integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product sizes"
  ON public.product_sizes FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert product sizes"
  ON public.product_sizes FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update product sizes"
  ON public.product_sizes FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete product sizes"
  ON public.product_sizes FOR DELETE USING (true);

-- ============================================================
-- 5. SALES TABLE
-- ============================================================
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

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert sales"
  ON public.sales FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can read sales"
  ON public.sales FOR SELECT USING (true);

CREATE POLICY "Service role can update sales"
  ON public.sales FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete sales"
  ON public.sales FOR DELETE USING (true);

-- ============================================================
-- 6. CONTACT MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated can read contact messages"
  ON public.contact_messages FOR SELECT USING (true);

-- ============================================================
-- DONE! Your database is ready.
-- ============================================================
