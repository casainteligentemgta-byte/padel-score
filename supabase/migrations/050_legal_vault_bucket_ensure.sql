-- Corrige "Bucket not found | 404" en legal_vault cuando el remoto no tenía 042/045 aplicados.
-- Idempotente: seguro ejecutarlo varias veces.

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

DROP POLICY IF EXISTS "legal_vault_bucket_select_authenticated" ON storage.buckets;
CREATE POLICY "legal_vault_bucket_select_authenticated"
  ON storage.buckets
  FOR SELECT
  TO authenticated
  USING (id = 'legal_vault');

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
