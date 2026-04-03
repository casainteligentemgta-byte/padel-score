-- split_ratio como INTEGER 0–100 (alineado con la app: guarda Math.round(ratio01 * 100)).
-- Convierte legado FLOAT 0–1 (p. ej. 0.5 → 50).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'display_templates'
      AND column_name = 'split_ratio'
      AND udt_name IN ('float4', 'float8', 'numeric')
  ) THEN
    ALTER TABLE public.display_templates
      ALTER COLUMN split_ratio DROP DEFAULT;

    ALTER TABLE public.display_templates
      ALTER COLUMN split_ratio TYPE INTEGER
      USING (
        CASE
          WHEN split_ratio::numeric > 1 THEN LEAST(100, GREATEST(0, ROUND(split_ratio::numeric)))::integer
          ELSE LEAST(100, GREATEST(0, ROUND(split_ratio::numeric * 100)))::integer
        END
      );

    ALTER TABLE public.display_templates
      ALTER COLUMN split_ratio SET DEFAULT 50;
  END IF;
END$$;
