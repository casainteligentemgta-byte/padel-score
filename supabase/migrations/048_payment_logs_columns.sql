-- Campos para el módulo de Reporte de Pago Móvil

ALTER TABLE public.payment_logs
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS amount_bs NUMERIC,
  ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Ajusta CHECK si no existiera (no destructivo; en algunos casos puede fallar si ya existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'payment_logs_status_check'
  ) THEN
    ALTER TABLE public.payment_logs
      ADD CONSTRAINT payment_logs_status_check
      CHECK (status IN ('pending', 'paid', 'alert'));
  END IF;
END $$;

