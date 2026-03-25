-- Relacion many-to-many media <-> cancha con metadata de orden y duracion

ALTER TABLE public.media_content
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;

CREATE TABLE IF NOT EXISTS public.cancha_publicidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_name TEXT NOT NULL,
  cancha_id TEXT NOT NULL,
  media_id UUID NOT NULL REFERENCES public.media_content(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL DEFAULT 1,
  duracion_segundos INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cancha_publicidad_unique
  ON public.cancha_publicidad(venue_name, cancha_id, media_id, orden);

CREATE INDEX IF NOT EXISTS idx_cancha_publicidad_cancha_orden
  ON public.cancha_publicidad(cancha_id, orden);

ALTER TABLE public.cancha_publicidad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for cancha_publicidad" ON public.cancha_publicidad
  FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'set_updated_at' AND n.nspname = 'public'
  ) THEN
    DROP TRIGGER IF EXISTS cancha_publicidad_updated_at ON public.cancha_publicidad;
    CREATE TRIGGER cancha_publicidad_updated_at
      BEFORE UPDATE ON public.cancha_publicidad
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

