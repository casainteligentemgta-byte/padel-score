-- Añadir columna is_placeholder a inscriptions para poder filtrar y sustituir por inscripciones reales
ALTER TABLE public.inscriptions
ADD COLUMN IF NOT EXISTS is_placeholder BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_inscriptions_placeholder ON public.inscriptions(tournament_id, category_key) WHERE is_placeholder = true;
