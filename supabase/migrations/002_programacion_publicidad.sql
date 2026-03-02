-- =============================================================================
-- Programación horaria de publicidad por pantalla
-- Ejecutar en el SQL Editor de Supabase si no usas migraciones automáticas
-- =============================================================================

-- Contenido por defecto en pantallas (cuando no hay programación activa)
ALTER TABLE public.pantallas
  ADD COLUMN IF NOT EXISTS contenido_actual_id UUID REFERENCES public.media_content(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.pantallas.contenido_actual_id IS 'Contenido por defecto cuando no hay ningún bloque en programacion_publicidad para la hora actual';

-- programacion_publicidad: bloques horarios (hora_inicio, hora_fin) con contenido y prioridad
CREATE TABLE IF NOT EXISTS public.programacion_publicidad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pantalla_id UUID REFERENCES public.pantallas(id) ON DELETE CASCADE,
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  media_content_id UUID NOT NULL REFERENCES public.media_content(id) ON DELETE CASCADE,
  prioridad INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.programacion_publicidad IS 'Bloques horarios: qué contenido mostrar en qué franja. hora_inicio/hora_fin en formato HH:MM o HH:MM:SS. prioridad mayor gana si hay solapamiento. pantalla_id NULL = aplica a todas.';
COMMENT ON COLUMN public.programacion_publicidad.hora_inicio IS 'Ej: 09:00 o 09:00:00';
COMMENT ON COLUMN public.programacion_publicidad.hora_fin IS 'Ej: 14:00 o 14:00:00';
COMMENT ON COLUMN public.programacion_publicidad.prioridad IS 'Si varias filas coinciden en la hora actual, se elige la de mayor prioridad';

CREATE INDEX IF NOT EXISTS idx_programacion_pantalla ON public.programacion_publicidad(pantalla_id);
CREATE INDEX IF NOT EXISTS idx_programacion_media ON public.programacion_publicidad(media_content_id);

ALTER TABLE public.programacion_publicidad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for programacion_publicidad" ON public.programacion_publicidad
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER programacion_publicidad_updated_at BEFORE UPDATE ON public.programacion_publicidad
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
