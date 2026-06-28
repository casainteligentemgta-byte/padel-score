-- Dispositivos TV Express: activación por PIN + token persistente.

CREATE TABLE IF NOT EXISTS public.tv_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_slug TEXT NOT NULL,
  court_number TEXT NOT NULL,
  pin_code TEXT,
  device_token TEXT,
  is_authorized BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tv_devices_club_court_key UNIQUE (club_slug, court_number)
);

CREATE INDEX IF NOT EXISTS idx_tv_devices_pin_pending
  ON public.tv_devices (pin_code)
  WHERE pin_code IS NOT NULL AND is_authorized = false;

COMMENT ON TABLE public.tv_devices IS
  'Pantallas Express por sede/cancha; PIN de activación y device_token persistente.';

COMMENT ON COLUMN public.tv_devices.club_slug IS
  'Identificador de sede (mismo valor que express_matches.base_venue / ?complex=).';

COMMENT ON COLUMN public.tv_devices.court_number IS
  'Número de pista sin prefijo fast-, ej. 1 → cancha fast-1.';

ALTER TABLE public.tv_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for tv_devices" ON public.tv_devices;
CREATE POLICY "Allow all for tv_devices"
  ON public.tv_devices FOR ALL USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS tv_devices_updated_at ON public.tv_devices;
CREATE TRIGGER tv_devices_updated_at
  BEFORE UPDATE ON public.tv_devices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
