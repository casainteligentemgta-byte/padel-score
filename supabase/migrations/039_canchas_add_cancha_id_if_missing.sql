-- La app (heartbeat, publicidad FK, templates) usa public.canchas.cancha_id (TEXT, ej. cancha_1).
-- Si la tabla existía sin esta columna: column canchas.cancha_id does not exist

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'canchas'
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'canchas' AND column_name = 'cancha_id'
  ) THEN
    RETURN;
  END IF;

  ALTER TABLE public.canchas ADD COLUMN cancha_id TEXT;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'canchas' AND column_name = 'id'
  ) THEN
    EXECUTE 'UPDATE public.canchas SET cancha_id = id::text WHERE cancha_id IS NULL';
  END IF;

  UPDATE public.canchas c
  SET cancha_id = 'cancha_legacy_' || sub.rn::text
  FROM (
    SELECT ctid, row_number() OVER (ORDER BY ctid) AS rn
    FROM public.canchas
    WHERE cancha_id IS NULL
  ) sub
  WHERE c.ctid = sub.ctid;

  ALTER TABLE public.canchas ALTER COLUMN cancha_id SET NOT NULL;

  CREATE UNIQUE INDEX IF NOT EXISTS idx_canchas_cancha_id_unique ON public.canchas (cancha_id);
END$$;

COMMENT ON COLUMN public.canchas.cancha_id IS 'Identificador lógico de pista: cancha_1, cancha_2, … (heartbeat, FK publicidad, apply template)';
