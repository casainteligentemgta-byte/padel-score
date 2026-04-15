-- Dossier de publicidad (Google Drive): ID de carpeta editable por admin desde /admin/publicidad

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS publicidad_dossier_drive_id TEXT;

COMMENT ON COLUMN public.admin_settings.publicidad_dossier_drive_id IS 'ID de carpeta de Google Drive para el dossier de publicidad (vista y enlace desde admin).';

-- Valor inicial sugerido solo si aún no hay ID guardado
UPDATE public.admin_settings
SET publicidad_dossier_drive_id = '1gVXdnsbgNIH8B_uq2tSqlc70ssL_5W1vakPBkuVSyrg'
WHERE id = 1
  AND (publicidad_dossier_drive_id IS NULL OR TRIM(publicidad_dossier_drive_id) = '');
