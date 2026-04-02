-- Quitar UNIQUE (cancha + media) u homólogo: impide varias filas con el mismo media_id
-- en la misma cancha (p. ej. vídeo + imagen, o el mismo clip en distinto orden/slot).
-- La unicidad correcta es por sede + cancha + slot + orden (migración 020).

ALTER TABLE public.cancha_publicidad
  DROP CONSTRAINT IF EXISTS uq_cancha_publicidad_cancha_media;

DROP INDEX IF EXISTS public.uq_cancha_publicidad_cancha_media;

-- Variantes que a veces se crean a mano en el SQL Editor:
DROP INDEX IF EXISTS public.idx_cancha_publicidad_cancha_media_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cancha_publicidad_slot_orden
  ON public.cancha_publicidad (venue_name, cancha_id, playlist_slot, orden);
