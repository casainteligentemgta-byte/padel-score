-- Sede/complejo para playlists Express (desde ?complex= en la TV)

ALTER TABLE public.express_matches
  ADD COLUMN IF NOT EXISTS base_venue TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.express_matches.base_venue IS
  'Nombre de sede (complex) para publicidad Express; lo escribe la TV desde ?complex=';
