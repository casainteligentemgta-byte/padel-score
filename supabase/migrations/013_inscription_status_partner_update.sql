-- Estado de reserva de pareja (WhatsApp / invitación)
ALTER TABLE public.inscriptions
  ADD COLUMN IF NOT EXISTS inscription_status TEXT DEFAULT 'NORMAL';

COMMENT ON COLUMN public.inscriptions.inscription_status IS 'NORMAL | RESERVED | CONFIRMED';

CREATE INDEX IF NOT EXISTS idx_inscriptions_inscription_status
  ON public.inscriptions (inscription_status);

-- El invitado (partnerId en data JSON) puede pasar RESERVED → CONFIRMED
DROP POLICY IF EXISTS "Allow partner confirm reserved inscription" ON public.inscriptions;
CREATE POLICY "Allow partner confirm reserved inscription"
  ON public.inscriptions
  FOR UPDATE
  USING (
    inscription_status = 'RESERVED'
    AND coalesce(data->>'partnerId', '') = auth.uid()::text
  )
  WITH CHECK (
    inscription_status = 'CONFIRMED'
    AND coalesce(data->>'partnerId', '') = auth.uid()::text
  );
