-- Orientación lógica del template (split media en filas vs columnas) y escala tipográfica base.

ALTER TABLE public.display_templates
  ADD COLUMN IF NOT EXISTS orientation TEXT NOT NULL DEFAULT 'landscape';

ALTER TABLE public.display_templates
  ADD COLUMN IF NOT EXISTS font_scale DOUBLE PRECISION NOT NULL DEFAULT 1;

ALTER TABLE public.display_templates
  DROP CONSTRAINT IF EXISTS display_templates_orientation_check;

ALTER TABLE public.display_templates
  ADD CONSTRAINT display_templates_orientation_check
  CHECK (orientation IN ('landscape', 'portrait'));

COMMENT ON COLUMN public.display_templates.orientation IS
  'landscape: vídeo | carrusel en columnas; portrait: vídeo arriba | carrusel abajo (filas).';

COMMENT ON COLUMN public.display_templates.font_scale IS
  'Multiplicador base; SmartDisplay aplica --pizarra-font-scale (vertical ~0.85×).';
