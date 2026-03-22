-- Estado de cada cancha para marcador/pizarra (sustituye Firebase RTDB canchas/{canchaId})
CREATE TABLE IF NOT EXISTS public.pizarra_cancha_state (
  cancha_id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.pizarra_cancha_state IS 'Estado en vivo de cada cancha: marcador, equipos, marker_uid (reemplazo RTDB canchas/)';

ALTER TABLE public.pizarra_cancha_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all pizarra_cancha_state" ON public.pizarra_cancha_state FOR ALL USING (true) WITH CHECK (true);
