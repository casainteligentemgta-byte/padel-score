-- Ejecuta este SQL en Supabase: SQL Editor → New query → Pegar y Run.
-- Crea las tablas necesarias para la app (migración desde Firebase/Firestore).

-- Perfiles de usuario (vinculados a auth.users por id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'player',
  name TEXT,
  email TEXT,
  marker_canchas TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Torneos
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partidos de cada torneo
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id TEXT NOT NULL,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tournament_id, id)
);

-- Participantes
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grupos
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Publicidad / Ads
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inscripciones
CREATE TABLE IF NOT EXISTS public.inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  tournament_id UUID,
  tournament_name TEXT,
  category_key TEXT,
  category_price NUMERIC,
  participant_name TEXT,
  participant_email TEXT,
  participant_id UUID,
  amount_extracted NUMERIC,
  receipt_url TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  alert_message TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuración global (una sola fila)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id INT PRIMARY KEY DEFAULT 1,
  app_title TEXT DEFAULT 'Smart Padel',
  club_name TEXT DEFAULT '',
  timezone TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tournaments_owner ON public.tournaments(owner_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament ON public.tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_participants_owner ON public.participants(owner_id);
CREATE INDEX IF NOT EXISTS idx_groups_owner ON public.groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_expenses_owner ON public.expenses(owner_id);
CREATE INDEX IF NOT EXISTS idx_ads_owner ON public.ads(owner_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_tournament ON public.inscriptions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_payment ON public.inscriptions(payment_status);

-- RLS: habilitar y políticas básicas (lectura/escritura para usuarios autenticados)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Perfiles: usuarios autenticados pueden leer (para listados admin); cada uno edita el suyo
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Torneos: owner puede todo; otros pueden leer (para pizarras públicas)
CREATE POLICY "tournaments_all" ON public.tournaments FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "tournaments_select" ON public.tournaments FOR SELECT USING (true);

-- Partidos: mismo criterio que torneos
CREATE POLICY "tournament_matches_all" ON public.tournament_matches FOR ALL
  USING (EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.owner_id = auth.uid()));
CREATE POLICY "tournament_matches_select" ON public.tournament_matches FOR SELECT USING (true);

-- Participantes, grupos, gastos: solo owner
CREATE POLICY "participants_owner" ON public.participants FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "groups_owner" ON public.groups FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "expenses_owner" ON public.expenses FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "ads_owner" ON public.ads FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "inscriptions_owner" ON public.inscriptions FOR ALL USING (auth.uid() = owner_id);

-- Admin settings: solo admins (perfil con role = admin)
CREATE POLICY "admin_settings_select" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "admin_settings_update" ON public.admin_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "admin_settings_insert" ON public.admin_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Insertar fila por defecto en admin_settings
INSERT INTO public.admin_settings (id, app_title, club_name, timezone)
VALUES (1, 'Smart Padel', '', '')
ON CONFLICT (id) DO NOTHING;
