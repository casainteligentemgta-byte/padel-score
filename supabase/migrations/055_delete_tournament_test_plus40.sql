-- Eliminar torneo(s) de prueba cuyo nombre (tournaments.data->>'name') coincide con "test +40" / "test+40" / "Torneo test +40", etc.
-- Orden: dependencias sin ON DELETE CASCADE explícito → luego la fila del torneo (inscriptions tiene ON DELETE CASCADE).

WITH doomed AS (
  SELECT id
  FROM public.tournaments
  WHERE coalesce(data->>'name', '') ~* 'test\s*\+?\s*40'
)
DELETE FROM public.payment_logs pl
WHERE pl.tournament_id IN (SELECT id FROM doomed);

WITH doomed AS (
  SELECT id
  FROM public.tournaments
  WHERE coalesce(data->>'name', '') ~* 'test\s*\+?\s*40'
)
DELETE FROM public.tournament_matches tm
WHERE tm.tournament_id IN (SELECT id FROM doomed);

WITH doomed AS (
  SELECT id
  FROM public.tournaments
  WHERE coalesce(data->>'name', '') ~* 'test\s*\+?\s*40'
)
DELETE FROM public.teams t
WHERE t.tournament_id IN (SELECT id FROM doomed);

DELETE FROM public.tournaments t
WHERE coalesce(t.data->>'name', '') ~* 'test\s*\+?\s*40';
