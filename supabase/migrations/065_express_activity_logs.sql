-- Registro de actividad Express: logins staff y activaciones de pizarra (informe diario Telegram).

CREATE TABLE IF NOT EXISTS public.express_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  club_slug TEXT,
  cancha_code TEXT,
  staff_name TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_express_activity_logs_created
  ON public.express_activity_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_express_activity_logs_type_created
  ON public.express_activity_logs (event_type, created_at DESC);

COMMENT ON TABLE public.express_activity_logs IS
  'Eventos Express: staff_telegram_login, pizarra_activated (informe admin 23:59 VE).';

ALTER TABLE public.express_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for express_activity_logs" ON public.express_activity_logs;
CREATE POLICY "Allow all for express_activity_logs"
  ON public.express_activity_logs FOR ALL USING (true) WITH CHECK (true);

-- Activación de pizarra: express_matches.is_active false → true
CREATE OR REPLACE FUNCTION public.log_express_pizarra_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active IS TRUE AND (TG_OP = 'INSERT' OR COALESCE(OLD.is_active, false) IS NOT TRUE) THEN
    INSERT INTO public.express_activity_logs (event_type, club_slug, cancha_code, details)
    VALUES (
      'pizarra_activated',
      NULLIF(trim(NEW.base_venue), ''),
      NEW.cancha_code,
      jsonb_build_object('session_id', NEW.session_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_express_pizarra_activation ON public.express_matches;
CREATE TRIGGER trg_express_pizarra_activation
  AFTER INSERT OR UPDATE OF is_active ON public.express_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.log_express_pizarra_activation();
