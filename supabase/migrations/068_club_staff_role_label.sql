-- Rol opcional del manejador (recepción, canchas, etc.).

ALTER TABLE public.club_staff
  ADD COLUMN IF NOT EXISTS role_label TEXT;

COMMENT ON COLUMN public.club_staff.role_label IS
  'Cargo o área del manejador, ej. Recepción, Encargado canchas.';
