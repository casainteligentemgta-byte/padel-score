-- Añadir last_seen a pantallas para detectar pantallas caídas (Edge Function + cron cada 5 min)
ALTER TABLE public.pantallas
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

COMMENT ON COLUMN public.pantallas.last_seen IS 'Última vez que la pantalla reportó estar viva; si hace >3 min y activa=true se marca como caída y se envía alerta WhatsApp';

CREATE INDEX IF NOT EXISTS idx_pantallas_last_seen ON public.pantallas(last_seen) WHERE activa = true;
