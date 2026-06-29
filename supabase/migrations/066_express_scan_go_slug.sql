-- Renombrar cancha_code fast-N → scan-go-N (marca Scan&Go en pantalla).

UPDATE public.express_matches
SET cancha_code = regexp_replace(cancha_code, '^fast-', 'scan-go-')
WHERE cancha_code ~ '^fast-[0-9]+$';

ALTER TABLE public.express_matches
  DROP CONSTRAINT IF EXISTS express_matches_cancha_code_format_chk;

ALTER TABLE public.express_matches
  ADD CONSTRAINT express_matches_cancha_code_format_chk
  CHECK (cancha_code ~ '^scan-go-[0-9]+$');

COMMENT ON COLUMN public.express_matches.cancha_code IS
  'Código de pista Express Scan&Go, ej. scan-go-3 → /display/express/scan-go-3';
