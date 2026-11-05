-- =============================================================================
-- 078: Lectura de inscriptions — dueño/pareja o admin (quita USING true)
-- Idempotente. No destructiva (no DROP TABLE / no borra filas).
-- NO aplicar en producción desde el agente. El owner la ejecuta en el SQL Editor.
--
-- - Sustituye inscriptions_public_read (052, USING true) y lecturas abiertas
-- - El jugador ve solo sus filas (owner/user/participant/partner o data.partnerId)
-- - El admin (is_admin_user) ve todas
-- - RPC pública sin PII para grillas / cupos de torneo
-- - Comparaciones y RETURNS TABLE casteadas a text/uuid (prod tiene IDs TEXT)
-- - No toca políticas de pizarra / TV
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SELECT: quitar políticas abiertas y recrear least-privilege
-- owner_id / user_id / participant_id / partner_id pueden ser uuid O text.
-- auth.uid() es uuid. Comparar siempre como text.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "inscriptions_public_read" ON public.inscriptions;
DROP POLICY IF EXISTS "Allow public view for inscriptions" ON public.inscriptions;
DROP POLICY IF EXISTS "inscriptions_select_related" ON public.inscriptions;
DROP POLICY IF EXISTS "inscriptions_select_own_or_admin" ON public.inscriptions;

CREATE POLICY "inscriptions_select_own_or_admin"
  ON public.inscriptions FOR SELECT
  TO authenticated
  USING (
    owner_id::text = auth.uid()::text
    OR user_id::text = auth.uid()::text
    OR participant_id::text = auth.uid()::text
    OR partner_id::text = auth.uid()::text
    OR (data->>'partnerId') = auth.uid()::text
    OR public.is_admin_user()
  );

-- -----------------------------------------------------------------------------
-- Roster público (nombres / grupo / categoría). Sin email, teléfono, pago, recibo.
-- Casts explícitos: en prod id/tournament_id pueden ser text.
-- DROP + CREATE para poder cambiar tipos OUT si se reaplica.
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.list_tournament_inscriptions_public(uuid);

CREATE FUNCTION public.list_tournament_inscriptions_public(p_tournament_id uuid)
RETURNS TABLE (
  id uuid,
  tournament_id uuid,
  category_key text,
  participant_name text,
  partner_name text,
  group_name text,
  is_placeholder boolean,
  inscription_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.id::uuid,
    i.tournament_id::uuid,
    i.category_key::text,
    i.participant_name::text,
    NULLIF(btrim(COALESCE(i.data->>'partnerName', '')), '')::text,
    i.group_name::text,
    COALESCE(i.is_placeholder::boolean, false),
    i.inscription_status::text
  FROM public.inscriptions i
  WHERE i.tournament_id::text = p_tournament_id::text;
$$;

REVOKE ALL ON FUNCTION public.list_tournament_inscriptions_public(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_tournament_inscriptions_public(uuid) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.list_tournament_inscriptions_public(uuid) IS
  'Roster público de un torneo: nombres y grupo. Sin PII de pago ni contacto.';

-- -----------------------------------------------------------------------------
-- notifications: fuente para /notifications (si aún no existe)
-- user_id / sender_id pueden ser uuid O text si la tabla ya existía.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  sender_id UUID,
  team_id UUID,
  type TEXT DEFAULT 'tournament_invite',
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text OR public.is_admin_user());

DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
CREATE POLICY "notifications_insert_own"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id::text = auth.uid()::text
    OR user_id::text = auth.uid()::text
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id::text = auth.uid()::text OR public.is_admin_user())
  WITH CHECK (user_id::text = auth.uid()::text OR public.is_admin_user());

GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
