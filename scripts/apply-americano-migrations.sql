-- =============================================================================
-- Módulo Americano — migraciones 072 + 073 + 074 (ejecutar en orden, una sola vez)
-- Supabase Dashboard → SQL Editor → New query → pegar todo → Run
-- =============================================================================

-- ── 072: tablas, realtime, RLS permisiva inicial ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.americano_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Americano',
  base_venue TEXT NOT NULL DEFAULT '',
  court_count INTEGER NOT NULL DEFAULT 2 CHECK (court_count >= 1 AND court_count <= 12),
  points_goal INTEGER NOT NULL DEFAULT 24 CHECK (points_goal IN (16, 24, 32, 40)),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'finished')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.americano_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.americano_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_americano_players_session
  ON public.americano_players (session_id);

CREATE TABLE IF NOT EXISTS public.americano_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.americano_sessions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number >= 1),
  court_number INTEGER NOT NULL CHECK (court_number >= 1),
  player_a1_id UUID NOT NULL REFERENCES public.americano_players(id) ON DELETE CASCADE,
  player_a2_id UUID NOT NULL REFERENCES public.americano_players(id) ON DELETE CASCADE,
  player_b1_id UUID NOT NULL REFERENCES public.americano_players(id) ON DELETE CASCADE,
  player_b2_id UUID NOT NULL REFERENCES public.americano_players(id) ON DELETE CASCADE,
  score_a INTEGER NOT NULL DEFAULT 0 CHECK (score_a >= 0),
  score_b INTEGER NOT NULL DEFAULT 0 CHECK (score_b >= 0),
  points_goal INTEGER NOT NULL CHECK (points_goal IN (16, 24, 32, 40)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'finished')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT americano_matches_session_round_court_key
    UNIQUE (session_id, round_number, court_number)
);

CREATE INDEX IF NOT EXISTS idx_americano_matches_session
  ON public.americano_matches (session_id);

ALTER TABLE public.americano_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.americano_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.americano_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all americano_sessions" ON public.americano_sessions;
CREATE POLICY "Allow all americano_sessions"
  ON public.americano_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all americano_players" ON public.americano_players;
CREATE POLICY "Allow all americano_players"
  ON public.americano_players FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all americano_matches" ON public.americano_matches;
CREATE POLICY "Allow all americano_matches"
  ON public.americano_matches FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.americano_sessions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.americano_players;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.americano_matches;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 073: puente torneo + submit atómico ──────────────────────────────────────

ALTER TABLE public.americano_sessions
  ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_americano_sessions_tournament
  ON public.americano_sessions (tournament_id);

COMMENT ON COLUMN public.americano_sessions.tournament_id IS
  'Torneo legacy vinculado (AMERICANO_INDIVIDUAL). NULL = sesión standalone del laboratorio.';

CREATE OR REPLACE FUNCTION public.submit_americano_match_result(
  p_match_id UUID,
  p_score_a INTEGER,
  p_score_b INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match public.americano_matches%ROWTYPE;
BEGIN
  SELECT * INTO v_match
  FROM public.americano_matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partido no encontrado';
  END IF;

  IF v_match.status = 'finished' THEN
    RAISE EXCEPTION 'Este partido ya tiene resultado';
  END IF;

  IF p_score_a < 0 OR p_score_b < 0 THEN
    RAISE EXCEPTION 'Los puntos no pueden ser negativos';
  END IF;

  IF p_score_a = p_score_b THEN
    RAISE EXCEPTION 'No puede haber empate';
  END IF;

  IF GREATEST(p_score_a, p_score_b) <> v_match.points_goal THEN
    RAISE EXCEPTION 'El ganador debe llegar a % puntos', v_match.points_goal;
  END IF;

  IF GREATEST(p_score_a, p_score_b) + LEAST(p_score_a, p_score_b) > (v_match.points_goal * 2 - 1) THEN
    RAISE EXCEPTION 'Marcador inválido para este formato';
  END IF;

  UPDATE public.americano_matches
  SET
    score_a = p_score_a,
    score_b = p_score_b,
    status = 'finished',
    updated_at = now()
  WHERE id = p_match_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se pudo actualizar el partido';
  END IF;

  UPDATE public.americano_players
  SET total_points = total_points + p_score_a
  WHERE id IN (v_match.player_a1_id, v_match.player_a2_id);

  UPDATE public.americano_players
  SET total_points = total_points + p_score_b
  WHERE id IN (v_match.player_b1_id, v_match.player_b2_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_americano_match_result(UUID, INTEGER, INTEGER) TO service_role;

-- ── 074: RLS restrictiva + recálculo y corrección ────────────────────────────

DROP POLICY IF EXISTS "Allow all americano_sessions" ON public.americano_sessions;
DROP POLICY IF EXISTS "Allow all americano_players" ON public.americano_players;
DROP POLICY IF EXISTS "Allow all americano_matches" ON public.americano_matches;

CREATE POLICY "americano_sessions_select_public"
  ON public.americano_sessions FOR SELECT USING (true);

CREATE POLICY "americano_players_select_public"
  ON public.americano_players FOR SELECT USING (true);

CREATE POLICY "americano_matches_select_public"
  ON public.americano_matches FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.recalculate_americano_session_points(p_session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.americano_players
  SET total_points = 0
  WHERE session_id = p_session_id;

  UPDATE public.americano_players ap
  SET total_points = sub.total
  FROM (
    SELECT player_id, SUM(pts)::INTEGER AS total
    FROM (
      SELECT player_a1_id AS player_id, score_a AS pts
      FROM public.americano_matches
      WHERE session_id = p_session_id AND status = 'finished'
      UNION ALL
      SELECT player_a2_id, score_a
      FROM public.americano_matches
      WHERE session_id = p_session_id AND status = 'finished'
      UNION ALL
      SELECT player_b1_id, score_b
      FROM public.americano_matches
      WHERE session_id = p_session_id AND status = 'finished'
      UNION ALL
      SELECT player_b2_id, score_b
      FROM public.americano_matches
      WHERE session_id = p_session_id AND status = 'finished'
    ) raw
    GROUP BY player_id
  ) sub
  WHERE ap.id = sub.player_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.recalculate_americano_session_points(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.correct_americano_match_result(
  p_match_id UUID,
  p_score_a INTEGER,
  p_score_b INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match public.americano_matches%ROWTYPE;
  v_points_goal INTEGER;
BEGIN
  SELECT * INTO v_match
  FROM public.americano_matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partido no encontrado';
  END IF;

  v_points_goal := v_match.points_goal;

  IF p_score_a < 0 OR p_score_b < 0 THEN
    RAISE EXCEPTION 'Los puntos no pueden ser negativos';
  END IF;

  IF p_score_a = p_score_b THEN
    RAISE EXCEPTION 'No puede haber empate';
  END IF;

  IF GREATEST(p_score_a, p_score_b) <> v_points_goal THEN
    RAISE EXCEPTION 'El ganador debe llegar a % puntos', v_points_goal;
  END IF;

  IF GREATEST(p_score_a, p_score_b) + LEAST(p_score_a, p_score_b) > (v_points_goal * 2 - 1) THEN
    RAISE EXCEPTION 'Marcador inválido para este formato';
  END IF;

  UPDATE public.americano_matches
  SET
    score_a = p_score_a,
    score_b = p_score_b,
    status = 'finished',
    updated_at = now()
  WHERE id = p_match_id;

  PERFORM public.recalculate_americano_session_points(v_match.session_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.correct_americano_match_result(UUID, INTEGER, INTEGER) TO service_role;

-- ── Verificación (debe devolver 3 tablas + 3 funciones) ─────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'americano_%'
ORDER BY table_name;

SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%americano%'
ORDER BY routine_name;
