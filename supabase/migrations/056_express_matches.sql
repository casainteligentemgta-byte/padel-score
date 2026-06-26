-- =============================================================================
-- express_matches: marcador informal (Express Match) por cancha
-- -----------------------------------------------------------------------------
-- Una fila por pista express (cancha_code único: fast-1, fast-2, …).
-- Flujo:
--   TV  → /display/express/fast-3  (auto-provision por cancha_code)
--   QR  → /express/control/{session_id}
--   Móvil marca puntos → Realtime → TV
--
-- Realtime (Dashboard o SQL si tu proyecto lo permite):
--   ALTER PUBLICATION supabase_realtime ADD TABLE public.express_matches;
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.express_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  cancha_code TEXT NOT NULL,

  session_id UUID NOT NULL DEFAULT gen_random_uuid(),

  team_a_name TEXT NOT NULL DEFAULT 'EQUIPO A',
  team_b_name TEXT NOT NULL DEFAULT 'EQUIPO B',
  team_a_avatar TEXT,
  team_b_avatar TEXT,

  team_a_points TEXT NOT NULL DEFAULT '0',
  team_b_points TEXT NOT NULL DEFAULT '0',

  team_a_games INTEGER NOT NULL DEFAULT 0,
  team_b_games INTEGER NOT NULL DEFAULT 0,

  sets_a INTEGER[] NOT NULL DEFAULT ARRAY[0, 0, 0],
  sets_b INTEGER[] NOT NULL DEFAULT ARRAY[0, 0, 0],

  current_set INTEGER NOT NULL DEFAULT 1,

  modo_puntos TEXT NOT NULL DEFAULT 'normal'
    CHECK (modo_puntos IN ('normal', 'tiebreak')),

  punto_de_oro BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT express_matches_cancha_code_key UNIQUE (cancha_code),
  CONSTRAINT express_matches_cancha_code_format_chk
    CHECK (cancha_code ~ '^fast-[0-9]+$'),
  CONSTRAINT express_matches_current_set_chk
    CHECK (current_set >= 1 AND current_set <= 3),
  CONSTRAINT express_matches_games_non_negative_chk
    CHECK (team_a_games >= 0 AND team_b_games >= 0)
);

CREATE INDEX IF NOT EXISTS idx_express_matches_session_id
  ON public.express_matches (session_id);

CREATE INDEX IF NOT EXISTS idx_express_matches_is_active
  ON public.express_matches (is_active);

COMMENT ON TABLE public.express_matches IS
  'Partido express por cancha (sin torneo): TV standby + control móvil vía session_id.';

COMMENT ON COLUMN public.express_matches.cancha_code IS
  'Código de pista express, ej. fast-3 → URL /display/express/fast-3';

COMMENT ON COLUMN public.express_matches.session_id IS
  'UUID de sesión de control; al cerrar se regenera para nuevo QR.';

COMMENT ON COLUMN public.express_matches.modo_puntos IS
  'normal = 0/15/30/40/AD; tiebreak = puntos numéricos en team_*_points.';

ALTER TABLE public.express_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for express_matches" ON public.express_matches;
CREATE POLICY "Allow all for express_matches"
  ON public.express_matches
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS express_matches_updated_at ON public.express_matches;
CREATE TRIGGER express_matches_updated_at
  BEFORE UPDATE ON public.express_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
