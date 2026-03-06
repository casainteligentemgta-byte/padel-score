-- ============================================
-- Padel Score — RLS: profiles + admin_settings
-- Pegar todo en Supabase → SQL Editor → Run
-- ============================================

-- 1. Función auxiliar: rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Tabla profiles (solo si no existe)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'player',
  name text DEFAULT '',
  email text,
  marker_canchas text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;

CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.get_my_role() = 'admin'
  );

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR public.get_my_role() = 'admin'
  );

-- 3. Tabla admin_settings (solo si no existe)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id int PRIMARY KEY DEFAULT 1,
  app_title text DEFAULT 'Smart Padel',
  club_name text DEFAULT '',
  timezone text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_settings (id, app_title)
VALUES (1, 'Smart Padel')
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "admin_settings_select_authenticated" ON public.admin_settings;
DROP POLICY IF EXISTS "admin_settings_update_admin" ON public.admin_settings;

CREATE POLICY "admin_settings_select_authenticated"
  ON public.admin_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_settings_update_admin"
  ON public.admin_settings FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- 4. Trigger: crear perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, email, updated_at)
  VALUES (
    NEW.id,
    'player',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
