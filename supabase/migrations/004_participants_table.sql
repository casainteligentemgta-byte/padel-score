-- Tabla participants (jugadores) para registro desde la app.
-- Ejecutar en Supabase: SQL Editor → New query → Pegar y Run.

CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participants_owner ON public.participants(owner_id);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participants_owner" ON public.participants;
CREATE POLICY "participants_owner"
  ON public.participants
  FOR ALL
  USING (auth.uid() = owner_id);
