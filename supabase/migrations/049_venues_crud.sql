-- Módulo de Gestión de Sedes

CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  rif TEXT,
  contact TEXT,
  phone TEXT,
  email TEXT,
  instagram TEXT,
  city TEXT,
  courts_count INTEGER NOT NULL DEFAULT 1,
  logo_url TEXT,
  brand_primary TEXT DEFAULT '#CCFF00',
  brand_secondary TEXT DEFAULT '#0A0A0A',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS venues_slug_idx ON public.venues(slug);
CREATE INDEX IF NOT EXISTS venues_active_idx ON public.venues(is_active);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venues_select_authenticated" ON public.venues;
CREATE POLICY "venues_select_authenticated"
  ON public.venues
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "venues_admin_insert" ON public.venues;
CREATE POLICY "venues_admin_insert"
  ON public.venues
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "venues_admin_update" ON public.venues;
CREATE POLICY "venues_admin_update"
  ON public.venues
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "venues_admin_delete" ON public.venues;
CREATE POLICY "venues_admin_delete"
  ON public.venues
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Bucket para logos de clubes
INSERT INTO storage.buckets (id, name, public)
VALUES ('venues', 'venues', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "venues_bucket_read_public" ON storage.objects;
CREATE POLICY "venues_bucket_read_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'venues');

DROP POLICY IF EXISTS "venues_bucket_admin_write" ON storage.objects;
CREATE POLICY "venues_bucket_admin_write"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'venues'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'venues'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

