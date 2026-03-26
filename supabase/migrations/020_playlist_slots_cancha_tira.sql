-- Playlists separadas por cancha: video / imagen + config de carrusel + asignación de tira

ALTER TABLE public.cancha_publicidad
  ADD COLUMN IF NOT EXISTS playlist_slot TEXT NOT NULL DEFAULT 'legacy';

COMMENT ON COLUMN public.cancha_publicidad.playlist_slot IS 'video | imagen | legacy (legacy = compat: se reparte por tipo de media en cliente)';

-- Normalizar filas existentes según tipo de media
UPDATE public.cancha_publicidad cp
SET playlist_slot = CASE
  WHEN mc.tipo = 'imagen' THEN 'imagen'
  WHEN mc.tipo IS NULL THEN 'legacy'
  ELSE 'video'
END
FROM public.media_content mc
WHERE mc.id = cp.media_id;

DROP INDEX IF EXISTS idx_cancha_publicidad_unique;

-- Reordenar por slot para evitar colisiones en índice único
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY venue_name, cancha_id, playlist_slot
      ORDER BY orden NULLS LAST, created_at, id
    ) AS rn
  FROM public.cancha_publicidad
)
UPDATE public.cancha_publicidad cp
SET orden = ranked.rn::integer
FROM ranked
WHERE cp.id = ranked.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cancha_publicidad_slot_orden
  ON public.cancha_publicidad(venue_name, cancha_id, playlist_slot, orden);

CREATE TABLE IF NOT EXISTS public.cancha_playlist_config (
  venue_name TEXT NOT NULL,
  cancha_id TEXT NOT NULL,
  imagen_loop BOOLEAN NOT NULL DEFAULT true,
  imagen_pausa_entre_segundos INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (venue_name, cancha_id)
);

COMMENT ON TABLE public.cancha_playlist_config IS 'Opciones del carrusel de imágenes por cancha (loop y pausa entre fotos)';

ALTER TABLE public.cancha_playlist_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all cancha_playlist_config" ON public.cancha_playlist_config
  FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.cancha_tira (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_name TEXT NOT NULL,
  cancha_id TEXT NOT NULL,
  tira_informativa_id UUID NOT NULL REFERENCES public.tira_informativa(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (venue_name, cancha_id, tira_informativa_id)
);

CREATE INDEX IF NOT EXISTS idx_cancha_tira_cancha ON public.cancha_tira(venue_name, cancha_id, orden);

COMMENT ON TABLE public.cancha_tira IS 'Mensajes de tira informativa asignados a una cancha concreta';

ALTER TABLE public.cancha_tira ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all cancha_tira" ON public.cancha_tira FOR ALL USING (true) WITH CHECK (true);
