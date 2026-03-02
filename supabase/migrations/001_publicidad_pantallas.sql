-- =============================================================================
-- Sistema de gestión de publicidad y contenidos para pantallas (pizarras)
-- Ejecutar en el SQL Editor de Supabase
-- =============================================================================

-- Extensión UUID (habitualmente ya activa en Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. media_content: contenido (videos por URL, videos subidos, imágenes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL CHECK (tipo IN ('video_url', 'video_file', 'imagen')),
  url TEXT NOT NULL,
  nombre_sponsor TEXT,
  duracion_segundos INTEGER,
  nombre TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.media_content IS 'Videos (URL YouTube/Vimeo o archivo) e imágenes para pantallas';
COMMENT ON COLUMN public.media_content.tipo IS 'video_url | video_file | imagen';
COMMENT ON COLUMN public.media_content.duracion_segundos IS 'Para imágenes/carrusel: tiempo en pantalla en segundos';

-- Índices
CREATE INDEX IF NOT EXISTS idx_media_content_tipo ON public.media_content(tipo);
CREATE INDEX IF NOT EXISTS idx_media_content_created_at ON public.media_content(created_at DESC);

-- -----------------------------------------------------------------------------
-- 2. pantallas: registro de cada TV/Monitor
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pantallas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.pantallas IS 'Cada TV/monitor del club';

CREATE INDEX IF NOT EXISTS idx_pantallas_activa ON public.pantallas(activa) WHERE activa = true;

-- -----------------------------------------------------------------------------
-- 3. configuracion_display: qué contenido va a qué pantalla (Modo Global o Individual)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuracion_display (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pantalla_id UUID REFERENCES public.pantallas(id) ON DELETE CASCADE,
  media_content_id UUID REFERENCES public.media_content(id) ON DELETE SET NULL,
  modo TEXT NOT NULL DEFAULT 'global' CHECK (modo IN ('global', 'individual')),
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pantalla_id)
);

COMMENT ON TABLE public.configuracion_display IS 'Asignación contenido → pantalla. Si pantalla_id es NULL y modo=global, aplica a todas.';
COMMENT ON COLUMN public.configuracion_display.modo IS 'global = mismo contenido en todas; individual = esta pantalla tiene contenido propio';

-- Para "Modo Global": una fila con pantalla_id NULL indica el contenido global
-- Para "Modo Individual": una fila por pantalla_id con su media_content_id

CREATE INDEX IF NOT EXISTS idx_config_display_pantalla ON public.configuracion_display(pantalla_id);
CREATE INDEX IF NOT EXISTS idx_config_display_media ON public.configuracion_display(media_content_id);

-- -----------------------------------------------------------------------------
-- 4. tira_informativa: mensajes de texto que rotan en la parte inferior
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tira_informativa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mensaje TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.tira_informativa IS 'Mensajes para la tira deslizante (marquee) en pantallas';

CREATE INDEX IF NOT EXISTS idx_tira_activo_orden ON public.tira_informativa(activo, orden) WHERE activo = true;

-- -----------------------------------------------------------------------------
-- 5. Tabla para Realtime: estado actual por pantalla (qué mostrar ahora)
-- Se actualiza desde el Admin y las pantallas escuchan aquí
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.display_estado (
  pantalla_id UUID PRIMARY KEY REFERENCES public.pantallas(id) ON DELETE CASCADE,
  media_content_id UUID REFERENCES public.media_content(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.display_estado IS 'Estado actual de cada pantalla para Realtime (qué contenido mostrar ahora)';

-- Habilitar Realtime para que las pantallas reciban cambios al instante:
-- En Dashboard: Database → Replication → supabase_realtime → añadir tabla display_estado
-- O descomentar la línea siguiente (puede fallar si la publicación no lo permite):
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.display_estado;

-- -----------------------------------------------------------------------------
-- 6. RLS (Row Level Security) – opcional, según quién administre
-- -----------------------------------------------------------------------------
ALTER TABLE public.media_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantallas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_display ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tira_informativa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.display_estado ENABLE ROW LEVEL SECURITY;

-- Políticas: permitir todo a usuarios autenticados (ajustar según auth de tu app)
-- Si usas anon key en las pantallas, permite lectura pública a display_estado y tira_informativa

CREATE POLICY "Allow all for media_content" ON public.media_content
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for pantallas" ON public.pantallas
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for configuracion_display" ON public.configuracion_display
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for tira_informativa" ON public.tira_informativa
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for display_estado" ON public.display_estado
  FOR ALL USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 7. Triggers updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER media_content_updated_at BEFORE UPDATE ON public.media_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER pantallas_updated_at BEFORE UPDATE ON public.pantallas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER configuracion_display_updated_at BEFORE UPDATE ON public.configuracion_display
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tira_informativa_updated_at BEFORE UPDATE ON public.tira_informativa
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 8. Storage: Bucket público "publicidad" (ejecutar en Dashboard o aquí)
-- En Supabase Dashboard: Storage → New bucket → nombre "publicidad" → Public
-- O vía SQL (si tu proyecto lo permite):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('publicidad', 'publicidad', true);
-- -----------------------------------------------------------------------------
