-- Heartbeat de pantallas /display/court y logs de error de reproducción

CREATE TABLE IF NOT EXISTS public.canchas (
  cancha_id TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.canchas IS 'Presencia de la pizarra /display/court: heartbeat periódico desde el cliente';

CREATE INDEX IF NOT EXISTS idx_canchas_last_seen ON public.canchas(last_seen DESC);

ALTER TABLE public.canchas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for canchas" ON public.canchas FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cancha_id TEXT NOT NULL,
  archivo_nombre TEXT,
  archivo_url TEXT,
  mensaje TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.error_logs IS 'Errores de carga de video u otros en pizarra/display';

CREATE INDEX IF NOT EXISTS idx_error_logs_cancha ON public.error_logs(cancha_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON public.error_logs(created_at DESC);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for error_logs" ON public.error_logs FOR ALL USING (true) WITH CHECK (true);
