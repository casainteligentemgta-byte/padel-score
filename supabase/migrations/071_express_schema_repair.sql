-- Reparación idempotente del esquema Express (cancha scan-go, columnas y checks).
-- Ejecutar si Telegram reset o marcador móvil fallan por columnas o fast-N legacy.

-- 1) Renombrar fast-N → scan-go-N
UPDATE public.express_matches
SET cancha_code = regexp_replace(cancha_code, '^fast-', 'scan-go-')
WHERE cancha_code ~ '^fast-[0-9]+$';

ALTER TABLE public.express_matches
  DROP CONSTRAINT IF EXISTS express_matches_cancha_code_format_chk;

ALTER TABLE public.express_matches
  ADD CONSTRAINT express_matches_cancha_code_format_chk
  CHECK (cancha_code ~ '^scan-go-[0-9]+$');

-- 2) Jugadores (057)
ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS team_a_p1_first TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_a_p1_last TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_a_p2_first TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_a_p2_last TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_b_p1_first TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_b_p1_last TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_b_p2_first TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_b_p2_last TEXT NOT NULL DEFAULT '';

-- 3) base_venue (058)
ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS base_venue TEXT NOT NULL DEFAULT '';

-- 4) QR (063)
ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS qr_expires_at TIMESTAMPTZ;

-- 5) display scales (059, 060)
ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS display_name_scale DOUBLE PRECISION NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS display_media_scale DOUBLE PRECISION NOT NULL DEFAULT 1;

-- 6) ticker (064)
ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS display_ticker_phrases TEXT[] NOT NULL DEFAULT '{}';

-- 7) third set (067)
ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS third_set_mode TEXT NOT NULL DEFAULT 'full';

ALTER TABLE public.express_matches
  DROP CONSTRAINT IF EXISTS express_matches_third_set_mode_chk;

ALTER TABLE public.express_matches
  ADD CONSTRAINT express_matches_third_set_mode_chk
  CHECK (third_set_mode IN ('full', 'tiebreak', 'super'));

ALTER TABLE public.express_matches
  DROP CONSTRAINT IF EXISTS express_matches_modo_puntos_check;

ALTER TABLE public.express_matches
  ADD CONSTRAINT express_matches_modo_puntos_check
  CHECK (modo_puntos IN ('normal', 'tiebreak', 'super_tiebreak'));

-- 8) saque (069)
ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS server_team INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS server_player INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.express_matches
  DROP CONSTRAINT IF EXISTS express_matches_server_team_chk;

ALTER TABLE public.express_matches
  ADD CONSTRAINT express_matches_server_team_chk
  CHECK (server_team IN (1, 2));

ALTER TABLE public.express_matches
  DROP CONSTRAINT IF EXISTS express_matches_server_player_chk;

ALTER TABLE public.express_matches
  ADD CONSTRAINT express_matches_server_player_chk
  CHECK (server_player IN (1, 2));

-- 9) sesión / cronómetro (070)
ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS warmup_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS match_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS chrono_elapsed_sec INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS match_ended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS side_change_until TIMESTAMPTZ;
