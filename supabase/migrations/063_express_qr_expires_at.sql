-- Ventana temporal de QR en TV Express (activación vía Telegram).

ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS qr_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN public.express_matches.qr_expires_at IS
  'Si está en el futuro y is_active=false, la TV muestra el QR. Null = QR siempre en standby (legacy).';
