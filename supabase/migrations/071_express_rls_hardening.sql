-- =============================================================================
-- Express: endurecimiento RLS (pizarra, staff, TV, activity logs)
-- -----------------------------------------------------------------------------
-- Cliente anon/authenticated:
--   express_matches  → lectura pública; escritura acotada + trigger de guardia
--   express_activity_logs, club_staff, tv_devices → sin acceso directo
-- Service role (API, Telegram, cron) → bypass del trigger vía current_user
-- =============================================================================

-- -----------------------------------------------------------------------------
-- express_matches
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow all for express_matches" ON public.express_matches;

CREATE POLICY "express_matches_select_public"
  ON public.express_matches
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "express_matches_update_client"
  ON public.express_matches
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- INSERT / DELETE: sin política para anon/authenticated → denegado por defecto.

CREATE OR REPLACE FUNCTION public.express_is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(auth.jwt() ->> 'role', ''),
    ''
  ) = 'service_role'
    OR current_user IN ('service_role', 'postgres', 'supabase_admin');
$$;

CREATE OR REPLACE FUNCTION public.guard_express_matches_client_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  game_state_changed boolean;
  venue_only boolean;
  activation boolean;
  session_end boolean;
BEGIN
  IF public.express_is_service_role() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'express_matches: insert no permitido desde cliente';
  END IF;

  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.cancha_code IS DISTINCT FROM OLD.cancha_code
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'express_matches: columna inmutable';
  END IF;

  IF NEW.qr_expires_at IS DISTINCT FROM OLD.qr_expires_at AND NEW.qr_expires_at IS NOT NULL THEN
    RAISE EXCEPTION 'express_matches: qr_expires_at solo puede borrarse desde cliente';
  END IF;

  game_state_changed := (
    NEW.team_a_points IS DISTINCT FROM OLD.team_a_points
    OR NEW.team_b_points IS DISTINCT FROM OLD.team_b_points
    OR NEW.team_a_games IS DISTINCT FROM OLD.team_a_games
    OR NEW.team_b_games IS DISTINCT FROM OLD.team_b_games
    OR NEW.sets_a IS DISTINCT FROM OLD.sets_a
    OR NEW.sets_b IS DISTINCT FROM OLD.sets_b
    OR NEW.current_set IS DISTINCT FROM OLD.current_set
    OR NEW.modo_puntos IS DISTINCT FROM OLD.modo_puntos
    OR NEW.server_team IS DISTINCT FROM OLD.server_team
    OR NEW.server_player IS DISTINCT FROM OLD.server_player
    OR NEW.punto_de_oro IS DISTINCT FROM OLD.punto_de_oro
    OR NEW.third_set_mode IS DISTINCT FROM OLD.third_set_mode
    OR NEW.team_a_name IS DISTINCT FROM OLD.team_a_name
    OR NEW.team_b_name IS DISTINCT FROM OLD.team_b_name
    OR NEW.team_a_p1_first IS DISTINCT FROM OLD.team_a_p1_first
    OR NEW.team_a_p1_last IS DISTINCT FROM OLD.team_a_p1_last
    OR NEW.team_a_p2_first IS DISTINCT FROM OLD.team_a_p2_first
    OR NEW.team_a_p2_last IS DISTINCT FROM OLD.team_a_p2_last
    OR NEW.team_b_p1_first IS DISTINCT FROM OLD.team_b_p1_first
    OR NEW.team_b_p1_last IS DISTINCT FROM OLD.team_b_p1_last
    OR NEW.team_b_p2_first IS DISTINCT FROM OLD.team_b_p2_first
    OR NEW.team_b_p2_last IS DISTINCT FROM OLD.team_b_p2_last
    OR NEW.team_a_avatar IS DISTINCT FROM OLD.team_a_avatar
    OR NEW.team_b_avatar IS DISTINCT FROM OLD.team_b_avatar
    OR NEW.display_name_scale IS DISTINCT FROM OLD.display_name_scale
    OR NEW.display_media_scale IS DISTINCT FROM OLD.display_media_scale
    OR NEW.display_ticker_phrases IS DISTINCT FROM OLD.display_ticker_phrases
    OR NEW.warmup_ends_at IS DISTINCT FROM OLD.warmup_ends_at
    OR NEW.match_started_at IS DISTINCT FROM OLD.match_started_at
    OR NEW.chrono_elapsed_sec IS DISTINCT FROM OLD.chrono_elapsed_sec
    OR NEW.match_ended_at IS DISTINCT FROM OLD.match_ended_at
    OR NEW.side_change_until IS DISTINCT FROM OLD.side_change_until
  );

  venue_only := (
    NEW.base_venue IS DISTINCT FROM OLD.base_venue
    AND NOT game_state_changed
    AND NEW.is_active IS NOT DISTINCT FROM OLD.is_active
    AND NEW.session_id IS NOT DISTINCT FROM OLD.session_id
    AND NEW.qr_expires_at IS NOT DISTINCT FROM OLD.qr_expires_at
  );

  activation := (
    OLD.is_active IS FALSE
    AND NEW.is_active IS TRUE
    AND NEW.qr_expires_at IS NULL
    AND NEW.session_id IS NOT DISTINCT FROM OLD.session_id
    AND OLD.qr_expires_at IS NOT NULL
    AND NOT game_state_changed
  );

  session_end := (
    OLD.is_active IS TRUE
    AND NEW.is_active IS FALSE
  );

  IF venue_only OR activation OR session_end THEN
    RETURN NEW;
  END IF;

  IF OLD.is_active IS TRUE
    AND NEW.is_active IS TRUE
    AND NEW.session_id IS NOT DISTINCT FROM OLD.session_id
  THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'express_matches: actualización no permitida en este estado';
END;
$$;

COMMENT ON FUNCTION public.express_is_service_role() IS
  'Detecta peticiones con service_role (Telegram, cron, APIs).';

COMMENT ON FUNCTION public.guard_express_matches_client_write() IS
  'Bloquea escrituras Express peligrosas desde anon/authenticated.';

DROP TRIGGER IF EXISTS trg_guard_express_matches_client_write ON public.express_matches;
CREATE TRIGGER trg_guard_express_matches_client_write
  BEFORE INSERT OR UPDATE ON public.express_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_express_matches_client_write();

-- -----------------------------------------------------------------------------
-- express_activity_logs
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow all for express_activity_logs" ON public.express_activity_logs;

-- -----------------------------------------------------------------------------
-- club_staff (auth_code, telegram_chat_id)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow all for club_staff" ON public.club_staff;

-- -----------------------------------------------------------------------------
-- tv_devices (PIN, device_token)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow all for tv_devices" ON public.tv_devices;
