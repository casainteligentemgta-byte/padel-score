-- Formato del 3er set en partidos Express (control móvil → scoring + TV).

ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS third_set_mode TEXT NOT NULL DEFAULT 'full';

ALTER TABLE public.express_matches
  DROP CONSTRAINT IF EXISTS express_matches_third_set_mode_chk;

ALTER TABLE public.express_matches
  ADD CONSTRAINT express_matches_third_set_mode_chk
  CHECK (third_set_mode IN ('full', 'tiebreak', 'super'));

COMMENT ON COLUMN public.express_matches.third_set_mode IS
  'Formato del 3er set: full = set completo; tiebreak = tie-break a 7; super = súper tie-break a 10.';

-- Permitir modo_puntos super_tiebreak en el marcador Express.
ALTER TABLE public.express_matches
  DROP CONSTRAINT IF EXISTS express_matches_modo_puntos_check;

ALTER TABLE public.express_matches
  ADD CONSTRAINT express_matches_modo_puntos_check
  CHECK (modo_puntos IN ('normal', 'tiebreak', 'super_tiebreak'));

COMMENT ON COLUMN public.express_matches.modo_puntos IS
  'normal = 0/15/30/40/AD; tiebreak = 0-7+2; super_tiebreak = 0-10+2 (3er set).';
