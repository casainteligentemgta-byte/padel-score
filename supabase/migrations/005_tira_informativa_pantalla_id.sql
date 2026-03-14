-- Añade pantalla_id a tira_informativa para asignar mensajes a una pantalla concreta o a todas (null)
-- Ejecutar en el SQL Editor de Supabase si la columna no existe

ALTER TABLE public.tira_informativa
  ADD COLUMN IF NOT EXISTS pantalla_id UUID REFERENCES public.pantallas(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.tira_informativa.pantalla_id IS 'Si es NULL, el mensaje se muestra en todas las pantallas; si tiene valor, solo en esa pantalla';

CREATE INDEX IF NOT EXISTS idx_tira_informativa_pantalla_id ON public.tira_informativa(pantalla_id);
