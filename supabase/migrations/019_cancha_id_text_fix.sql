-- La app usa identificadores de cancha como texto 'cancha_1', 'cancha_2', etc.
-- Si alguna tabla quedó con cancha_id UUID (o se creó a mano mal), Postgres devuelve:
--   invalid input syntax for type uuid: "cancha_1"
-- Este script convierte cancha_id a TEXT cuando aún es uuid.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.table_name::text AS tname
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.column_name = 'cancha_id'
      AND c.data_type = 'uuid'
      AND c.table_name IN ('cancha_publicidad', 'canchas', 'error_logs')
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN cancha_id TYPE TEXT USING cancha_id::text',
      r.tname
    );
  END LOOP;
END$$;
