-- Calentamiento, cronómetro, cambio de lado y resumen al finalizar partido express.

ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS warmup_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS match_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS chrono_elapsed_sec INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS match_ended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS side_change_until TIMESTAMPTZ;

COMMENT ON COLUMN public.express_matches.warmup_ends_at IS
  'Fin del calentamiento (5 min). Null = sin calentamiento activo.';

COMMENT ON COLUMN public.express_matches.match_started_at IS
  'Inicio del cronómetro de partido (tras calentamiento o primer punto).';

COMMENT ON COLUMN public.express_matches.chrono_elapsed_sec IS
  'Segundos congelados al terminar el partido.';

COMMENT ON COLUMN public.express_matches.match_ended_at IS
  'Marca fin natural del partido; mantiene resumen en TV hasta nuevo partido o reset.';

COMMENT ON COLUMN public.express_matches.side_change_until IS
  'Banner de cambio de lado visible hasta esta hora.';
