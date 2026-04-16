-- Smart Consent / Pago Móvil: antifraude por referencias

CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  tournament_id UUID,
  inscription_id UUID,
  reference_number TEXT NOT NULL,
  bank_origin TEXT,
  phone_emitter TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT payment_logs_reference_number_key UNIQUE (reference_number)
);

ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Lectura/inscripción “propia” para usuarios autenticados (el antifraude global se hace vía service role).
DROP POLICY IF EXISTS "payment_logs_select_own" ON public.payment_logs;
CREATE POLICY "payment_logs_select_own"
  ON public.payment_logs
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid()::text);

DROP POLICY IF EXISTS "payment_logs_insert_own" ON public.payment_logs;
CREATE POLICY "payment_logs_insert_own"
  ON public.payment_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid()::text);

-- Nota: No se crea policy global para SELECT/INSERT.

