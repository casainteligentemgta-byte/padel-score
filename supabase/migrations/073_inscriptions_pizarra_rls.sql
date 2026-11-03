-- =============================================================================
-- 073: Inscripciones y pizarra — least privilege
-- - Quita lectura pública de inscriptions (PII / pagos)
-- - El dueño no puede escribir payment_status ni category_price
-- - INSERT de inscripciones reales: service_role (API) o admin (placeholders)
-- - pizarra_cancha / pizarra_cancha_state: SELECT público, writes staff
--
-- NO aplicar en producción desde el agente. El owner la ejecuta en el SQL Editor.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Inscriptions: drop políticas abiertas
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "inscriptions_owner" ON public.inscriptions;
DROP POLICY IF EXISTS "inscriptions_admin" ON public.inscriptions;
DROP POLICY IF EXISTS "inscriptions_public_read" ON public.inscriptions;
DROP POLICY IF EXISTS "Allow public view for inscriptions" ON public.inscriptions;
DROP POLICY IF EXISTS "Allow authenticated insert for inscriptions" ON public.inscriptions;
DROP POLICY IF EXISTS "Allow update for owners or admins" ON public.inscriptions;
DROP POLICY IF EXISTS "inscriptions_select_related" ON public.inscriptions;
DROP POLICY IF EXISTS "inscriptions_insert_staff" ON public.inscriptions;
DROP POLICY IF EXISTS "inscriptions_update_related" ON public.inscriptions;
DROP POLICY IF EXISTS "inscriptions_delete_admin" ON public.inscriptions;

CREATE POLICY "inscriptions_select_related"
  ON public.inscriptions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR auth.uid() = user_id
    OR auth.uid() = partner_id
    OR public.is_admin_or_staff()
  );

CREATE POLICY "inscriptions_insert_staff"
  ON public.inscriptions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_staff());

CREATE POLICY "inscriptions_update_related"
  ON public.inscriptions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR auth.uid() = user_id
    OR auth.uid() = partner_id
    OR public.is_admin_or_staff()
  )
  WITH CHECK (
    auth.uid() = owner_id
    OR auth.uid() = user_id
    OR auth.uid() = partner_id
    OR public.is_admin_or_staff()
  );

CREATE POLICY "inscriptions_delete_admin"
  ON public.inscriptions FOR DELETE
  TO authenticated
  USING (public.is_admin_or_staff());

-- Congela columnas de pago/precio salvo service_role o admin/staff.
CREATE OR REPLACE FUNCTION public.inscriptions_guard_payment_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF public.is_admin_or_staff() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.payment_status := OLD.payment_status;
    NEW.category_price := OLD.category_price;
    NEW.category_key := OLD.category_key;
    NEW.tournament_id := OLD.tournament_id;
    NEW.owner_id := OLD.owner_id;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inscriptions_guard_payment ON public.inscriptions;
CREATE TRIGGER trg_inscriptions_guard_payment
  BEFORE UPDATE ON public.inscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.inscriptions_guard_payment_columns();

REVOKE ALL ON FUNCTION public.inscriptions_guard_payment_columns() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inscriptions_guard_payment_columns() TO authenticated, service_role;

COMMENT ON FUNCTION public.inscriptions_guard_payment_columns() IS
  'Impide que un jugador cambie payment_status, category_price o dueño de su inscripción.';

-- -----------------------------------------------------------------------------
-- Pizarra: lectura pública (TV), escritura staff
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all for pizarra_cancha" ON public.pizarra_cancha;
DROP POLICY IF EXISTS "pizarra_cancha_select_public" ON public.pizarra_cancha;
DROP POLICY IF EXISTS "pizarra_cancha_write_staff" ON public.pizarra_cancha;
CREATE POLICY "pizarra_cancha_select_public"
  ON public.pizarra_cancha FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "pizarra_cancha_write_staff"
  ON public.pizarra_cancha FOR ALL
  TO authenticated
  USING (public.is_admin_or_staff())
  WITH CHECK (public.is_admin_or_staff());

DO $$
BEGIN
  IF to_regclass('public.pizarra_cancha_state') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow all pizarra_cancha_state" ON public.pizarra_cancha_state';
    EXECUTE 'DROP POLICY IF EXISTS "pizarra_cancha_state_select_public" ON public.pizarra_cancha_state';
    EXECUTE 'DROP POLICY IF EXISTS "pizarra_cancha_state_write_staff" ON public.pizarra_cancha_state';
    EXECUTE $p$
      CREATE POLICY "pizarra_cancha_state_select_public"
        ON public.pizarra_cancha_state FOR SELECT
        TO anon, authenticated
        USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "pizarra_cancha_state_write_staff"
        ON public.pizarra_cancha_state FOR ALL
        TO authenticated
        USING (public.is_admin_or_staff())
        WITH CHECK (public.is_admin_or_staff())
    $p$;
  END IF;
END $$;
