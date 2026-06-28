-- Staff de club: login Telegram con /login CODIGO y botones de activación QR.

CREATE TABLE IF NOT EXISTS public.club_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  auth_code TEXT NOT NULL,
  telegram_chat_id BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT club_staff_auth_code_key UNIQUE (auth_code)
);

CREATE INDEX IF NOT EXISTS idx_club_staff_club_slug ON public.club_staff (club_slug);
CREATE INDEX IF NOT EXISTS idx_club_staff_telegram ON public.club_staff (telegram_chat_id)
  WHERE telegram_chat_id IS NOT NULL;

COMMENT ON TABLE public.club_staff IS
  'Personal autorizado para activar QR Express vía bot Telegram (/login CODIGO).';

COMMENT ON COLUMN public.club_staff.club_slug IS
  'Sede vinculada; debe coincidir con express_matches.base_venue.';

COMMENT ON COLUMN public.club_staff.auth_code IS
  'Código de vinculación Telegram, ej. BOD-1234.';

ALTER TABLE public.club_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for club_staff" ON public.club_staff;
CREATE POLICY "Allow all for club_staff"
  ON public.club_staff FOR ALL USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS club_staff_updated_at ON public.club_staff;
CREATE TRIGGER club_staff_updated_at
  BEFORE UPDATE ON public.club_staff
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
