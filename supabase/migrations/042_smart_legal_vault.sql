-- Smart-Legal: perfiles, bucket legal_vault, admin_settings.terms_version, cola de notificaciones (Edge Functions / webhooks).

-- Perfil: versión de términos aceptada y evidencias (rutas dentro del bucket legal_vault)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS accepted_terms_version TEXT,
  ADD COLUMN IF NOT EXISTS signature_url TEXT,
  ADD COLUMN IF NOT EXISTS biometric_photo_url TEXT;

COMMENT ON COLUMN public.profiles.signature_url IS 'Ruta de objeto en bucket legal_vault (ej. userId/timestamp-signature.png)';
COMMENT ON COLUMN public.profiles.biometric_photo_url IS 'Ruta de objeto en bucket legal_vault (ej. userId/timestamp-face.jpg)';

-- Versión global publicada (auditoría / disparadores hacia Edge Functions)
ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS terms_version TEXT NOT NULL DEFAULT 'v2.0-2026';

UPDATE public.admin_settings SET terms_version = 'v2.0-2026' WHERE id = 1 AND (terms_version IS NULL OR terms_version = '');

-- Cola para notificar por email cuando cambie terms_version (procesada por Edge Function o worker)
CREATE TABLE IF NOT EXISTS public.terms_notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_version TEXT,
  to_version TEXT NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  processed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.terms_notification_jobs IS 'Encolar envíos masivos (Resend/SendGrid) al actualizar términos globales.';

ALTER TABLE public.terms_notification_jobs ENABLE ROW LEVEL SECURITY;

-- Sin acceso vía anon/authenticated (la Edge Function usa service role y omite RLS).
DROP POLICY IF EXISTS "terms_notification_jobs_noaccess" ON public.terms_notification_jobs;
CREATE POLICY "terms_notification_jobs_noaccess"
  ON public.terms_notification_jobs FOR ALL
  USING (false)
  WITH CHECK (false);

-- Bucket privado para firmas y capturas biométricas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'legal_vault',
  'legal_vault',
  false,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas Storage: cada usuario autenticado solo en su carpeta (primer segmento = auth.uid())
DROP POLICY IF EXISTS "legal_vault_insert_own" ON storage.objects;
CREATE POLICY "legal_vault_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'legal_vault'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "legal_vault_select_own" ON storage.objects;
CREATE POLICY "legal_vault_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'legal_vault'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "legal_vault_update_own" ON storage.objects;
CREATE POLICY "legal_vault_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'legal_vault'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "legal_vault_delete_own" ON storage.objects;
CREATE POLICY "legal_vault_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'legal_vault'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
