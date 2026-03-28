-- Logros (catálogo) y trofeos otorgados por jugador (profiles.id)
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL DEFAULT 'gold' CHECK (tier IN ('gold', 'silver', 'bronze')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profile_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements (id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_achievements_profile ON public.profile_achievements (profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_achievements_awarded ON public.profile_achievements (awarded_at DESC);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_achievements ENABLE ROW LEVEL SECURITY;

-- Catálogo y vitrina visibles públicamente (perfil público / pantallas)
CREATE POLICY "achievements_select_public"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "profile_achievements_select_public"
  ON public.profile_achievements FOR SELECT
  USING (true);

-- Solo admins gestionan catálogo y asignaciones (app puede usar service role)
CREATE POLICY "achievements_admin_all"
  ON public.achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "profile_achievements_admin_all"
  ON public.profile_achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
