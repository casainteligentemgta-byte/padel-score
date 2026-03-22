-- Marca temporal de confirmación por el invitado (pareja)
ALTER TABLE public.inscriptions
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.inscriptions.confirmed_at IS 'Cuando el invitado (partnerId) confirma la reserva (inscription_status pasa a CONFIRMED).';
