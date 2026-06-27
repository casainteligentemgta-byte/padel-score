-- Escala del bloque vídeo + imágenes en pizarra Express (control móvil → TV vía Realtime).

ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS display_media_scale REAL NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.express_matches.display_media_scale IS
  'Multiplicador altura zona vídeo/imágenes en TV (0.5–1.75; default 1). Ajustable desde /express/control.';
