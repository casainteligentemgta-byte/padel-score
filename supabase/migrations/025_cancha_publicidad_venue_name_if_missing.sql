-- Compatibilidad: instancias donde `cancha_publicidad` existe sin `venue_name`
ALTER TABLE public.cancha_publicidad
  ADD COLUMN IF NOT EXISTS venue_name TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.cancha_publicidad.venue_name IS 'Sede / complejo (filtro en admin publicidad)';
