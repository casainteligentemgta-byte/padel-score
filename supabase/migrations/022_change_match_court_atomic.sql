-- Parte 1/2: helper para número de pista desde match.data (ver 032 para RPC principal + permisos).

CREATE OR REPLACE FUNCTION public._tm_court_from_data(d jsonb)
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    CASE
      WHEN d->>'court' IS NOT NULL AND trim(d->>'court') ~ '^[0-9]+$' THEN (trim(d->>'court'))::int
      ELSE NULL
    END,
    CASE
      WHEN d ? 'courtIndex' THEN COALESCE(NULLIF(trim(d->>'courtIndex'), '')::int, 0) + 1
      ELSE NULL
    END,
    1
  );
$$;
