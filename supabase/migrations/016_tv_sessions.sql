-- =============================================================================
-- tv_sessions: sistema de pantallas (TV) conectadas por short_id
-- -----------------------------------------------------------------------------
-- Crea una fila por TV (generada en /tv). El Admin (/admin/screens) cambia:
--   status: waiting | active
--   tournament_id
--   current_view: score/bracket/ads (y variantes score_court_1/2)
--
-- Realtime:
--   Asegura que la tabla esté habilitada para supabase_realtime en Dashboard
--   (o descomenta si tu proyecto lo permite):
--     ALTER PUBLICATION supabase_realtime ADD TABLE public.tv_sessions;
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.tv_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 4 dígitos para QR (rápido de leer en TV/Firestick)
  short_id INTEGER UNIQUE NOT NULL CHECK (short_id >= 1000 AND short_id <= 9999),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active')),
  -- score (genérico), score por cancha, bracket o ads
  current_view TEXT NOT NULL DEFAULT 'ads' CHECK (
    current_view IN ('score', 'score_court_1', 'score_court_2', 'bracket', 'ads')
  ),
  tournament_id UUID REFERENCES public.tournaments (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tv_sessions_short_id ON public.tv_sessions (short_id);
CREATE INDEX IF NOT EXISTS idx_tv_sessions_status ON public.tv_sessions (status);
CREATE INDEX IF NOT EXISTS idx_tv_sessions_tournament_id ON public.tv_sessions (tournament_id);

-- -----------------------------------------------------------------------------
-- RLS: permitir acceso libre desde la app (anon) tal como el resto del proyecto
-- Ajusta si quieres políticas más estrictas.
-- -----------------------------------------------------------------------------
ALTER TABLE public.tv_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for tv_sessions" ON public.tv_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tv_sessions_updated_at ON public.tv_sessions;
CREATE TRIGGER tv_sessions_updated_at
  BEFORE UPDATE ON public.tv_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

