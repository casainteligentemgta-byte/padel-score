-- =============================================================================
-- 076: Inscripciones de pago manual siempre pending hasta que un admin valide.
-- Idempotente. Seguro para producción.
-- =============================================================================

ALTER TABLE public.inscriptions
  ALTER COLUMN payment_status SET DEFAULT 'pending';

CREATE OR REPLACE FUNCTION public.inscriptions_force_manual_pending()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  method text;
BEGIN
  IF NEW.payment_status IS NULL OR btrim(NEW.payment_status) = '' THEN
    NEW.payment_status := 'pending';
  END IF;

  method := lower(coalesce(NEW.data->>'paymentMethod', NEW.data->>'payment_method', ''));

  -- Precio > 0 o método de pago informado: nunca auto-pagar en INSERT.
  IF TG_OP = 'INSERT' THEN
    IF coalesce(NEW.category_price, 0) > 0
       OR method <> '' THEN
      IF lower(coalesce(NEW.payment_status, 'pending')) = 'paid' THEN
        NEW.payment_status := 'pending';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inscriptions_force_manual_pending ON public.inscriptions;
CREATE TRIGGER trg_inscriptions_force_manual_pending
  BEFORE INSERT ON public.inscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.inscriptions_force_manual_pending();

REVOKE ALL ON FUNCTION public.inscriptions_force_manual_pending() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inscriptions_force_manual_pending() TO authenticated, service_role;

COMMENT ON FUNCTION public.inscriptions_force_manual_pending() IS
  'INSERT: pago manual / con precio no puede nacer como paid; el admin lo aprueba después.';
