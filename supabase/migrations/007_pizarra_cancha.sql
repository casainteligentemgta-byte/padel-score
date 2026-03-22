-- Asignación de partido a cada cancha para direcciones cortas /p/1, /p/2, /p/3
CREATE TABLE IF NOT EXISTS public.pizarra_cancha (
  court_number SMALLINT PRIMARY KEY CHECK (court_number IN (1, 2, 3)),
  tournament_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.pizarra_cancha IS 'Partido actual asignado a cada cancha para www.smartpadel58.com/p/1, /p/2, /p/3';

ALTER TABLE public.pizarra_cancha ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for pizarra_cancha" ON public.pizarra_cancha FOR ALL USING (true) WITH CHECK (true);
