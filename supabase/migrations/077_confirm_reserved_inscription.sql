-- =============================================================================
-- 077: Confirmar inscripción RESERVED → CONFIRMED (pareja acepta).
-- Idempotente. No destructiva. El admin sigue validando el pago por separado.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.confirm_reserved_inscription(p_inscription_id uuid)
RETURNS SETOF public.inscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para confirmar tu lugar.';
  END IF;

  RETURN QUERY
  UPDATE public.inscriptions AS i
  SET
    inscription_status = 'CONFIRMED',
    confirmed_at = coalesce(i.confirmed_at, now()),
    updated_at = now()
  WHERE i.id = p_inscription_id
    AND (
      i.partner_id = uid
      OR (i.data->>'partnerId') = uid::text
    )
    AND upper(coalesce(i.inscription_status, '')) IN ('RESERVED', 'CONFIRMED')
  RETURNING i.*;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se pudo confirmar la inscripción (no eres el invitado o ya no está reservada).';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_reserved_inscription(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_reserved_inscription(uuid) TO authenticated;

COMMENT ON FUNCTION public.confirm_reserved_inscription(uuid) IS
  'El compañero (partner_id / data.partnerId) pasa inscription_status de RESERVED a CONFIRMED. El pago sigue pending hasta el admin.';
