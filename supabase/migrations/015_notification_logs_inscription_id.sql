-- Vincular cada notificación al id de inscripción cuando aplique.
ALTER TABLE public.notification_logs
  ADD COLUMN IF NOT EXISTS inscription_id UUID;

CREATE INDEX IF NOT EXISTS idx_notification_logs_inscription_id
  ON public.notification_logs (inscription_id);

COMMENT ON COLUMN public.notification_logs.inscription_id
  IS 'ID de inscripción asociado al envío de notificación (si corresponde).';

