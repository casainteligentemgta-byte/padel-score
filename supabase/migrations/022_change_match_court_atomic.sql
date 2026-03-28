-- Traslado atómico de partido entre canchas: match.data + pizarra_cancha_state origen/destino.
-- Solo invocable con service_role (API Next.js).

CREATE OR REPLACE FUNCTION public._tm_court_from_data(d jsonb)
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    CASE
      WHEN d->>'court' IS NOT NULL AND trim(d->>'court') ~ '^[0-9]+$' THEN (trim(d->>'court'))::int
      ELSE NULL
    END,
    CASE
      WHEN d ? 'courtIndex' THEN COALESCE(NULLIF(trim(d->>'courtIndex'), '')::int, 0) + 1
      ELSE NULL
    END,
    1
  );
$$;

CREATE OR REPLACE FUNCTION public.change_match_court_atomic(
  p_tournament_id uuid,
  p_match_id text,
  p_from_court int,
  p_to_court int,
  p_pizarra_destination jsonb,
  p_court_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row record;
  v_merged jsonb;
  v_live_court int;
  v_my_court int;
  v_court_name text;
BEGIN
  IF p_from_court IS NULL OR p_to_court IS NULL OR p_from_court = p_to_court THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_courts');
  END IF;

  FOR v_row IN
    SELECT id, data FROM tournament_matches
    WHERE tournament_id = p_tournament_id AND id <> p_match_id
  LOOP
    IF upper(trim(COALESCE(v_row.data->>'status', ''))) <> 'LIVE' THEN
      CONTINUE;
    END IF;
    v_live_court := public._tm_court_from_data(v_row.data);
    IF v_live_court = p_to_court THEN
      RETURN jsonb_build_object('ok', false, 'error', 'destination_has_live_match');
    END IF;
  END LOOP;

  SELECT * INTO v_row
  FROM tournament_matches
  WHERE tournament_id = p_tournament_id AND id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'match_not_found');
  END IF;

  IF upper(trim(COALESCE(v_row.data->>'status', ''))) <> 'LIVE' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'match_not_live');
  END IF;

  v_my_court := public._tm_court_from_data(v_row.data);
  IF v_my_court IS DISTINCT FROM p_from_court THEN
    RETURN jsonb_build_object('ok', false, 'error', 'from_court_mismatch');
  END IF;

  v_court_name := COALESCE(NULLIF(trim(p_court_name), ''), 'Pista ' || p_to_court::text);

  v_merged := COALESCE(v_row.data, '{}'::jsonb)
    || jsonb_build_object(
      'court', p_to_court,
      'courtIndex', p_to_court - 1,
      'courtName', v_court_name
    );

  UPDATE tournament_matches
  SET data = v_merged, updated_at = now()
  WHERE tournament_id = p_tournament_id AND id = p_match_id;

  DELETE FROM pizarra_cancha_state
  WHERE cancha_id = ('cancha_' || p_from_court::text);

  INSERT INTO pizarra_cancha_state (cancha_id, data, updated_at)
  VALUES ('cancha_' || p_to_court::text, COALESCE(p_pizarra_destination, '{}'::jsonb), now())
  ON CONFLICT (cancha_id) DO UPDATE
  SET data = EXCLUDED.data, updated_at = now();

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public._tm_court_from_data(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.change_match_court_atomic(uuid, text, int, int, jsonb, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public._tm_court_from_data(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.change_match_court_atomic(uuid, text, int, int, jsonb, text) TO service_role;

COMMENT ON FUNCTION public.change_match_court_atomic IS 'Traslado atómico LIVE: valida destino libre, actualiza tournament_matches, migra pizarra_cancha_state.';
