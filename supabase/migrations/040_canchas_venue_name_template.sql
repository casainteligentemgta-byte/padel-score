-- Plantilla de pizarra por sede + cancha (misma noción que cancha_publicidad).
-- venue_name '' = registro “global” (p. ej. /display/court sin ?complex=)

ALTER TABLE public.canchas
  ADD COLUMN IF NOT EXISTS venue_name TEXT NOT NULL DEFAULT '';

UPDATE public.canchas SET venue_name = '' WHERE venue_name IS NULL;

DROP INDEX IF EXISTS public.idx_canchas_cancha_id_unique;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'canchas' AND c.contype = 'p'
  LOOP
    EXECUTE format('ALTER TABLE public.canchas DROP CONSTRAINT %I', r.conname);
  END LOOP;
END$$;

ALTER TABLE public.canchas
  ADD PRIMARY KEY (venue_name, cancha_id);

CREATE INDEX IF NOT EXISTS idx_canchas_venue_cancha ON public.canchas (venue_name, cancha_id);

COMMENT ON COLUMN public.canchas.venue_name IS 'Sede (complexName). Cadena vacía = sin sede en URL / modo global.';
