-- =============================================================================
-- Módulo Americano: sesiones, jugadores y partidos (rotación individual)
-- TV: /americano/tv/{session_id}  ·  Control: /americano/session/{session_id}
-- =============================================================================

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
