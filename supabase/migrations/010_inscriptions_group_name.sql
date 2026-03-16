-- Agrupar inscripciones por grupo en la grilla del torneo
ALTER TABLE public.inscriptions
ADD COLUMN IF NOT EXISTS group_name TEXT;

CREATE INDEX IF NOT EXISTS idx_inscriptions_group_name ON public.inscriptions(tournament_id, group_name);
