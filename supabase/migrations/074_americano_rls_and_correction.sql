-- RLS restrictiva + recálculo y corrección de resultados americano

-- ── RLS: lectura pública (TV), escritura solo vía service role ──────────────
DROP POLICY IF EXISTS "Allow all americano_sessions" ON public.americano_sessions;
DROP POLICY IF EXISTS "Allow all americano_players" ON public.americano_players;
DROP POLICY IF EXISTS "Allow all americano_matches" ON public.americano_matches;

CREATE POLICY "americano_sessions_select_public"
  ON public.americano_sessions FOR SELECT USING (true);

CREATE POLICY "americano_players_select_public"
  ON public.americano_players FOR SELECT USING (true);

CREATE POLICY "americano_matches_select_public"
  ON public.americano_matches FOR SELECT USING (true);

-- Sin políticas INSERT/UPDATE/DELETE para anon/authenticated → bloqueado salvo service role

-- ── Recálculo total desde partidos terminados ────────────────────────────────
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

-- ── Corrección de resultado (recalcula toda la sesión) ───────────────────────
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
