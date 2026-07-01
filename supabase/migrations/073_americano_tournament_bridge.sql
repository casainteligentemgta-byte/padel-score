-- Puente torneo legacy ↔ módulo americano + submit atómico de resultados

ALTER TABLE public.americano_sessions
  ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_americano_sessions_tournament
  ON public.americano_sessions (tournament_id);

COMMENT ON COLUMN public.americano_sessions.tournament_id IS
  'Torneo legacy vinculado (AMERICANO_INDIVIDUAL). NULL = sesión standalone del laboratorio.';

-- Actualización atómica de resultado + puntos acumulados
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
