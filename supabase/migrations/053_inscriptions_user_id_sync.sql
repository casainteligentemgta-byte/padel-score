-- Sincroniza user_id con owner_id: evita NULL en user_id (NOT NULL) si algún cliente
-- solo envía owner_id o el JSON del torneo pisa el owner en app.

-- 1) Columna (idempotente; en proyectos viejos puede no existir o ser nullable)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'inscriptions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.inscriptions ADD COLUMN user_id UUID;
  END IF;
END $$;

-- 2) Rellenar históricos: mismo valor que el dueño de la fila
UPDATE public.inscriptions
SET user_id = NULLIF(trim(owner_id::text), '')::uuid
WHERE user_id IS NULL
  AND owner_id IS NOT NULL;

-- 3) Disparador: en INSERT/UPDATE, si user_id sigue nulo, copiar desde owner_id
CREATE OR REPLACE FUNCTION public.inscriptions_sync_user_id_from_owner()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS NULL AND NEW.owner_id IS NOT NULL THEN
    NEW.user_id := NULLIF(trim(NEW.owner_id::text), '')::uuid;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inscriptions_sync_user_id ON public.inscriptions;
CREATE TRIGGER trg_inscriptions_sync_user_id
  BEFORE INSERT OR UPDATE ON public.inscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.inscriptions_sync_user_id_from_owner();

-- 4) NOT NULL en user_id solo si no quedan filas sin rellenar
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.inscriptions WHERE user_id IS NULL) THEN
    ALTER TABLE public.inscriptions ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

COMMENT ON FUNCTION public.inscriptions_sync_user_id_from_owner() IS
  'Alinea user_id con owner_id si el cliente no envió user_id (evita violación NOT NULL).';
