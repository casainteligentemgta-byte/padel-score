-- Intervalo opcional (minutos) por clip vs loop continuo (0 = secuencia/loop sin corte por minutos forzado en UI admin)
ALTER TABLE public.cancha_playlist_config
  ADD COLUMN IF NOT EXISTS video_cambio_cada_minutos INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.cancha_playlist_config
  ADD COLUMN IF NOT EXISTS imagen_cambio_cada_minutos INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.cancha_playlist_config
  ADD COLUMN IF NOT EXISTS tira_cambio_cada_minutos INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.cancha_playlist_config.video_cambio_cada_minutos IS '0 = loop continuo (avance al terminar el clip); >0 = forzar siguiente cada N minutos';
COMMENT ON COLUMN public.cancha_playlist_config.imagen_cambio_cada_minutos IS '0 = usar duración por ítem + loop carrusel; >0 = cada imagen N minutos';
COMMENT ON COLUMN public.cancha_playlist_config.tira_cambio_cada_minutos IS '0 = marquee continuo; >0 = rotar mensaje cada N minutos (consumidor)';
