-- Escala tipográfica de nombres en pizarra Express (control móvil → TV vía Realtime).

ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS display_name_scale REAL NOT NULL DEFAULT 1.25;

COMMENT ON COLUMN public.express_matches.display_name_scale IS
  'Multiplicador tamaño nombres jugadores en TV (0.85–1.6; default 1.25). Ajustable desde /express/control.';
