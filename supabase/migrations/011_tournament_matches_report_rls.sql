-- Seguridad resultados: la actualización del marcador desde /match/[id]/report
-- se hace solo vía POST /api/match/report, que valida que el usuario sea uno de los 4
-- jugadores del partido y usa SUPABASE_SERVICE_ROLE_KEY para escribir.
-- RLS existente (tournament_matches_all) solo permite UPDATE al owner del torneo desde el cliente;
-- los 4 jugadores no son owner, por tanto no pueden hacer update desde la consola.
-- Esta migración solo documenta; no cambia políticas para no romper el panel del torneo.
COMMENT ON TABLE public.tournament_matches IS 'Partidos del torneo. Resultados solo vía API /api/match/report (validación 4 jugadores).';
