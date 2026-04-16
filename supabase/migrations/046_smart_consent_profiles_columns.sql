-- Smart Consent: columnas de aceptación en `profiles`

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status_legal TEXT,
  ADD COLUMN IF NOT EXISTS legal_version TEXT,
  ADD COLUMN IF NOT EXISTS legal_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS user_ip TEXT;

