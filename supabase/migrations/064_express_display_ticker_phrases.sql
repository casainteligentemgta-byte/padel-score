-- Frases personalizadas en tira informativa por pizarra Express (control móvil).

ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS display_ticker_phrases JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.express_matches.display_ticker_phrases IS
  'Frases propias de esta pizarra en la tira inferior (JSON array de strings). Se muestran además de tira_informativa admin.';
