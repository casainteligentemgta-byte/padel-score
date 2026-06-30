-- Reset de pizarra Express desde Telegram (bypass RLS/trigger de guardia vía SECURITY DEFINER).

CREATE OR REPLACE FUNCTION public.resetear_express_cancha_telegram(
  p_court_number INTEGER,
  p_base_venue TEXT DEFAULT '',
  p_qr_window_minutes INTEGER DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scan_code TEXT;
  v_fast_code TEXT;
  v_match_id UUID;
  v_session_id UUID := gen_random_uuid();
  v_qr_expires TIMESTAMPTZ;
  v_venue TEXT;
BEGIN
  IF p_court_number IS NULL OR p_court_number < 1 THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Cancha inválida');
  END IF;

  v_scan_code := 'scan-go-' || p_court_number;
  v_fast_code := 'fast-' || p_court_number;
  v_qr_expires := now() + (GREATEST(1, COALESCE(p_qr_window_minutes, 5)) || ' minutes')::interval;
  v_venue := COALESCE(NULLIF(trim(p_base_venue), ''), '');

  SELECT id
  INTO v_match_id
  FROM public.express_matches
  WHERE cancha_code IN (v_scan_code, v_fast_code)
  ORDER BY CASE cancha_code WHEN v_scan_code THEN 0 ELSE 1 END
  LIMIT 1;

  IF v_match_id IS NOT NULL THEN
    UPDATE public.express_matches
    SET
      session_id = v_session_id,
      team_a_name = '',
      team_b_name = '',
      team_a_p1_first = '',
      team_a_p1_last = '',
      team_a_p2_first = '',
      team_a_p2_last = '',
      team_b_p1_first = '',
      team_b_p1_last = '',
      team_b_p2_first = '',
      team_b_p2_last = '',
      team_a_avatar = NULL,
      team_b_avatar = NULL,
      team_a_points = '0',
      team_b_points = '0',
      team_a_games = 0,
      team_b_games = 0,
      sets_a = ARRAY[0, 0, 0],
      sets_b = ARRAY[0, 0, 0],
      current_set = 1,
      modo_puntos = 'normal',
      punto_de_oro = true,
      third_set_mode = 'full',
      is_active = false,
      base_venue = CASE WHEN v_venue <> '' THEN v_venue ELSE base_venue END,
      qr_expires_at = v_qr_expires,
      server_team = 1,
      server_player = 1,
      warmup_ends_at = NULL,
      match_started_at = NULL,
      chrono_elapsed_sec = 0,
      match_ended_at = NULL,
      side_change_until = NULL
    WHERE id = v_match_id;
  ELSE
    BEGIN
      INSERT INTO public.express_matches (
        cancha_code,
        session_id,
        base_venue,
        qr_expires_at,
        is_active
      )
      VALUES (v_scan_code, v_session_id, v_venue, v_qr_expires, false);
    EXCEPTION
      WHEN check_violation THEN
        INSERT INTO public.express_matches (
          cancha_code,
          session_id,
          base_venue,
          qr_expires_at,
          is_active
        )
        VALUES (v_fast_code, v_session_id, v_venue, v_qr_expires, false);
    END;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'session_id', v_session_id,
    'cancha_code', COALESCE(
      (SELECT cancha_code FROM public.express_matches WHERE session_id = v_session_id LIMIT 1),
      v_scan_code
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'message', SQLERRM);
END;
$$;

COMMENT ON FUNCTION public.resetear_express_cancha_telegram(integer, text, integer) IS
  'Resetea marcador Express y abre ventana QR (Telegram staff). Ejecutar con service_role.';

REVOKE ALL ON FUNCTION public.resetear_express_cancha_telegram(integer, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resetear_express_cancha_telegram(integer, text, integer) TO service_role;
