-- UNIQUE (cancha_id, media_id, orden) sin sede ni slot: choca con playlists separadas
-- (mismo media en vídeo e imagen, o reordenar con el mismo id en otro slot).
-- Modelo correcto: único por (venue_name, cancha_id, playlist_slot, orden).

ALTER TABLE public.cancha_publicidad
  DROP CONSTRAINT IF EXISTS cancha_publicidad_cancha_id_media_id_orden_key;

DROP INDEX IF EXISTS public.cancha_publicidad_cancha_id_media_id_orden_key;

-- Por si el nombre en tu instancia varía ligeramente:
ALTER TABLE public.cancha_publicidad
  DROP CONSTRAINT IF EXISTS cancha_publicidad_cancha_id_media_id_orden_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cancha_publicidad_slot_orden
  ON public.cancha_publicidad (venue_name, cancha_id, playlist_slot, orden);
