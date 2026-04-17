-- Asegura columnas Smart-Legal en `profiles` (idempotente; por si 042 no se aplicó en remoto).
-- Ejecuta también en SQL Editor de Supabase si el cliente devuelve error de columna inexistente.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS accepted_terms_version TEXT,
  ADD COLUMN IF NOT EXISTS signature_url TEXT,
  ADD COLUMN IF NOT EXISTS biometric_photo_url TEXT;

COMMENT ON COLUMN public.profiles.accepted_terms_version IS 'Versión de términos legales aceptada (ej. v2.0-2026).';
COMMENT ON COLUMN public.profiles.signature_url IS 'Ruta en bucket legal_vault (ej. userId/timestamp-signature.png).';
COMMENT ON COLUMN public.profiles.biometric_photo_url IS 'Ruta en bucket legal_vault (ej. userId/timestamp-face.jpg).';
