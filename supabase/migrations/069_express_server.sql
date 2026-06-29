-- Sacador Express (equipo 1 = arriba / equipo 2 = abajo; jugador 1 o 2)
ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS server_team INTEGER NOT NULL DEFAULT 1
    CHECK (server_team IN (1, 2)),
  ADD COLUMN IF NOT EXISTS server_player INTEGER NOT NULL DEFAULT 1
    CHECK (server_player IN (1, 2));

COMMENT ON COLUMN public.express_matches.server_team IS
  'Equipo al saque: 1 = equipo A (arriba), 2 = equipo B (abajo).';

COMMENT ON COLUMN public.express_matches.server_player IS
  'Jugador al saque dentro del equipo: 1 = primer jugador, 2 = segundo.';
