-- Jugadores Express: 2 por equipo (nombre + apellido), sin "EQUIPO A/B"

ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS team_a_p1_first TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_a_p1_last TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_a_p2_first TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_a_p2_last TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_b_p1_first TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_b_p1_last TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_b_p2_first TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_b_p2_last TEXT NOT NULL DEFAULT '';

UPDATE public.express_matches
SET team_a_name = '', team_b_name = ''
WHERE team_a_name IN ('EQUIPO A', 'EQUIPO B') OR team_b_name IN ('EQUIPO A', 'EQUIPO B');

ALTER TABLE public.express_matches
  ALTER COLUMN team_a_name SET DEFAULT '',
  ALTER COLUMN team_b_name SET DEFAULT '';
