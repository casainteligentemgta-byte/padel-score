-- Quitar restricción única incorrecta (cancha_id + orden) que choca con playlists
-- separadas por slot (video e imagen comparten orden 1, 2, … en la misma cancha).
-- La unicidad correcta es (venue_name, cancha_id, playlist_slot, orden) — migración 020.

ALTER TABLE public.cancha_publicidad
  DROP CONSTRAINT IF EXISTS uq_cancha_publicidad_cancha_orden;

DROP INDEX IF EXISTS public.uq_cancha_publicidad_cancha_orden;

-- Por si existía como índice único con otro nombre típico:
DROP INDEX IF EXISTS public.idx_cancha_publicidad_cancha_orden_unique;

-- Asegurar índice único esperado por la app (idempotente).
CREATE UNIQUE INDEX IF NOT EXISTS idx_cancha_publicidad_slot_orden
  ON public.cancha_publicidad (venue_name, cancha_id, playlist_slot, orden);
