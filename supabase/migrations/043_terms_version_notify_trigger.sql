-- Opcional: disparar Edge Function al cambiar la versión global de términos.
-- Requiere `pg_net` o `supabase_functions.http_request` según tu proyecto.
-- Descomenta y ajusta la URL del deploy de `notify-terms-version-change`.

/*
CREATE OR REPLACE FUNCTION public.enqueue_terms_version_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.terms_version IS DISTINCT FROM OLD.terms_version THEN
    INSERT INTO public.terms_notification_jobs (from_version, to_version, status)
    VALUES (OLD.terms_version, NEW.terms_version, 'pending');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_settings_terms_version ON public.admin_settings;
CREATE TRIGGER trg_admin_settings_terms_version
  AFTER UPDATE OF terms_version ON public.admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.enqueue_terms_version_change();
*/
