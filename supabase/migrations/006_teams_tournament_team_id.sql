-- Enlace invitación → equipo del torneo: el primer jugador introduce el código del segundo y se guarda qué equipo del torneo corresponde.
-- Así, cuando el segundo acepta, se actualiza ese equipo directamente en la grilla.

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS tournament_team_id TEXT;

COMMENT ON COLUMN public.teams.tournament_team_id IS 'Id del equipo en tournament.teams; enlaza la invitación (código del compañero) con el slot en la grilla del torneo.';
