-- Cierre atómico: fusiona resultado en tournament_matches.data y libera pizarra_cancha_state de la cancha indicada.
--
-- Contrato (QA):
-- - Éxito: data = { "ok": true }, error del cliente = null.
-- - tournament_matches: data |= p_final_data (claves de p_final_data pisan); updated_at del partido se actualiza.
-- - pizarra_cancha_state (si hay fila y partido_id vacío o = p_match_id): data.estado = "finalizado",
--   torneo_id = texto del UUID del torneo, partido_id y active_match_id = null en JSON, pizarra_refresh_nonce +1, updated_at actualizado.
-- - Usuario no owner ni admin: { "ok": false, "error": "forbidden" }.
-- - Sin JWT (anon): { "ok": false, "error": "not_authenticated" } — requiere GRANT EXECUTE a anon.
--
-- Ampliar permisos (p. ej. marcador) en el cuerpo de la función si tu producto lo necesita.

CREATE OR REPLACE FUNCTION public.finalizar_partido_y_liberar_cancha(
  p_match_id text,
  p_tournament_id uuid,
  p_cancha_id text,
  p_final_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row record;
  v_merged jsonb;
  v_old jsonb;
  v_nonce int;
  v_pid text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.tournaments t
    WHERE t.id = p_tournament_id
      AND (
        t.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND lower(trim(COALESCE(p.role, ''))) = 'admin'
        )
      )
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  SELECT tm.id, tm.data
  INTO v_row
  FROM public.tournament_matches tm
  WHERE tm.tournament_id = p_tournament_id AND tm.id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'match_not_found');
  END IF;

  v_merged := COALESCE(v_row.data, '{}'::jsonb) || COALESCE(p_final_data, '{}'::jsonb);

  UPDATE public.tournament_matches
  SET data = v_merged, updated_at = now()
  WHERE tournament_id = p_tournament_id AND id = p_match_id;

  SELECT pcs.data INTO v_old
  FROM public.pizarra_cancha_state pcs
  WHERE pcs.cancha_id = p_cancha_id;

  IF FOUND THEN
    v_pid := trim(COALESCE(v_old->>'partido_id', ''));
    IF v_pid = '' OR v_pid = p_match_id THEN
      v_nonce := COALESCE(NULLIF(trim(COALESCE(v_old->>'pizarra_refresh_nonce', '')), '')::int, 0) + 1;
      UPDATE public.pizarra_cancha_state
      SET
        data = COALESCE(v_old, '{}'::jsonb)
          || jsonb_build_object(
            'estado', 'finalizado',
            'torneo_id', p_tournament_id::text,
            'partido_id', NULL,
            'active_match_id', NULL,
            'pizarra_refresh_nonce', v_nonce
          ),
        updated_at = now()
      WHERE cancha_id = p_cancha_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.finalizar_partido_y_liberar_cancha(text, uuid, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalizar_partido_y_liberar_cancha(text, uuid, text, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.finalizar_partido_y_liberar_cancha(text, uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalizar_partido_y_liberar_cancha(text, uuid, text, jsonb) TO service_role;

COMMENT ON FUNCTION public.finalizar_partido_y_liberar_cancha IS
  'Ver encabezado migración 023: ok true, merge data partido, pizarra finalizado + nonce, forbidden / not_authenticated.';
