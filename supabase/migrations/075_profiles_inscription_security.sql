-- =============================================================================
-- 075: Seguridad de perfiles e inscripciones
-- Idempotente. Aplicar a mano en producción (SQL Editor).
--
-- - Nadie (salvo admin o service_role) puede asignarse role/unique_code/marker_canchas
-- - INSERT de perfil fuerza role = 'player'
-- - SELECT de profiles: dueño o admin (se quitan políticas públicas / anon)
-- - RPC de lookup por código de 6 caracteres (id + nombre público)
-- - RPC de nombres públicos por ids (compañeros / ranking)
-- - RPC de ficha pública (sin PII sensible)
-- - RPC de cédula duplicada; índice único solo si no hay duplicados
-- - Trigger auth.users → profiles con términos desde user_metadata
-- - Bucket player-photos (si existe schema storage)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(public.get_my_role(), '')) = 'admin';
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Trigger: columnas privilegiadas
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profiles_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text := coalesce(auth.role(), '');
    -- Solo admin (no marker/staff) o service_role: un marker no debe poder
  -- auto-promoverse. is_admin_or_staff incluye marker.
  privileged boolean := (jwt_role = 'service_role') OR public.is_admin_user();
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT privileged THEN
      NEW.role := 'player';
      NEW.marker_canchas := COALESCE(NEW.marker_canchas, '{}'::text[]);
      IF NEW.marker_canchas IS DISTINCT FROM '{}'::text[] THEN
        NEW.marker_canchas := '{}'::text[];
      END IF;
    ELSIF NEW.role IS NULL OR btrim(NEW.role) = '' THEN
      NEW.role := 'player';
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE
  IF NOT privileged THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'No autorizado a cambiar role'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.marker_canchas IS DISTINCT FROM OLD.marker_canchas THEN
      RAISE EXCEPTION 'No autorizado a cambiar marker_canchas'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.unique_code IS DISTINCT FROM OLD.unique_code THEN
      -- Primera asignación del código propio (si aún no tenía)
      IF NOT (OLD.unique_code IS NULL AND NEW.unique_code IS NOT NULL AND auth.uid() = NEW.id) THEN
        RAISE EXCEPTION 'No autorizado a cambiar unique_code'
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_protect_privileged ON public.profiles;
CREATE TRIGGER trg_profiles_protect_privileged
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profiles_privileged_columns();

REVOKE ALL ON FUNCTION public.protect_profiles_privileged_columns() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.protect_profiles_privileged_columns() TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Políticas RLS de profiles
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Permitir búsqueda por código único" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_by_definer" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin_user());

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND lower(coalesce(role, 'player')) = 'player'
  );

CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin_user())
  WITH CHECK (auth.uid() = id OR public.is_admin_user());

-- -----------------------------------------------------------------------------
-- Código único + perfil al registrarse
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_unique_player_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code text;
  i int;
  n int;
BEGIN
  FOR n IN 1..40 LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, 1 + floor(random() * 36)::int, 1);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE unique_code = code) THEN
      RETURN code;
    END IF;
  END LOOP;
  RETURN upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
END;
$$;

REVOKE ALL ON FUNCTION public.generate_unique_player_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_unique_player_code() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_terms text;
BEGIN
  v_name := coalesce(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(coalesce(NEW.email, ''), '@', 1),
    ''
  );
  v_terms := nullif(btrim(coalesce(NEW.raw_user_meta_data->>'accepted_terms_version', '')), '');

  INSERT INTO public.profiles (
    id, role, name, email, unique_code, marker_canchas,
    accepted_terms_version, legal_version, status_legal, legal_timestamp,
    created_at, updated_at
  )
  VALUES (
    NEW.id,
    'player',
    v_name,
    NEW.email,
    public.generate_unique_player_code(),
    '{}'::text[],
    v_terms,
    v_terms,
    CASE WHEN v_terms IS NOT NULL THEN 'accepted' ELSE NULL END,
    CASE WHEN v_terms IS NOT NULL THEN now() ELSE NULL END,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- RPCs públicas mínimas (sin email / rol / PII)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lookup_profile_by_unique_code(p_code text)
RETURNS TABLE (id uuid, display_name text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
BEGIN
  v_code := upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  IF v_code !~ '^[A-Z0-9]{6}$' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.id, coalesce(nullif(btrim(p.name), ''), 'Jugador')
  FROM public.profiles p
  WHERE p.unique_code = v_code
  LIMIT 1;

  IF FOUND THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT coalesce(pr.id, part.owner_id),
         coalesce(
           nullif(btrim(pr.name), ''),
           nullif(btrim(part.data->>'fullName'), ''),
           nullif(btrim(concat_ws(' ', part.data->>'name', part.data->>'lastName')), ''),
           'Jugador'
         )
  FROM public.participants part
  LEFT JOIN public.profiles pr ON pr.id = part.owner_id
  WHERE upper(coalesce(part.data->>'uniqueCode', '')) = v_code
    AND part.owner_id IS NOT NULL
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.lookup_profile_by_unique_code(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lookup_profile_by_unique_code(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_profile_by_unique_code(text) TO service_role;

CREATE OR REPLACE FUNCTION public.lookup_profiles_display(p_ids uuid[])
RETURNS TABLE (id uuid, display_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, coalesce(nullif(btrim(p.name), ''), 'Jugador')
  FROM public.profiles p
  WHERE p.id = ANY (p_ids);
$$;

REVOKE ALL ON FUNCTION public.lookup_profiles_display(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_profiles_display(uuid[]) TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_public_participant(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  photo text;
BEGIN
  SELECT part.id, part.owner_id, part.data
  INTO r
  FROM public.participants part
  WHERE part.id = p_id
  LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  photo := r.data->>'photo';
  IF photo IS NOT NULL AND photo LIKE 'data:%' THEN
    photo := NULL;
  END IF;
  RETURN jsonb_build_object(
    'id', r.id,
    'ownerId', r.owner_id,
    'name', r.data->>'name',
    'lastName', r.data->>'lastName',
    'fullName', r.data->>'fullName',
    'uniqueCode', r.data->>'uniqueCode',
    'photo', photo,
    'level', r.data->'level',
    'position', r.data->>'position',
    'gender', r.data->>'gender'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_participant(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_participant(uuid) TO authenticated, anon;

-- -----------------------------------------------------------------------------
-- Cédula duplicada (normalizada V/E + dígitos)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normalize_ve_cedula(p_raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_raw IS NULL OR btrim(p_raw) = '' THEN NULL
    ELSE
      CASE
        WHEN upper(p_raw) ~ '^E' THEN 'E'
        ELSE 'V'
      END
      || regexp_replace(p_raw, '\D', '', 'g')
  END;
$$;

CREATE OR REPLACE FUNCTION public.participant_dni_taken(p_dni text, p_exclude uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_norm text := public.normalize_ve_cedula(p_dni);
BEGIN
  IF v_norm IS NULL OR v_norm !~ '^[VE][0-9]{6,9}$' THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.participants part
    WHERE public.normalize_ve_cedula(part.data->>'dni') = v_norm
      AND (p_exclude IS NULL OR part.id <> p_exclude)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.participant_dni_taken(text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.participant_dni_taken(text, uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.participant_dni_taken(text, uuid) TO service_role;

DO $$
DECLARE
  dup_count int;
  dup_sample text;
BEGIN
  SELECT COUNT(*), string_agg(dni_norm, ', ')
  INTO dup_count, dup_sample
  FROM (
    SELECT public.normalize_ve_cedula(data->>'dni') AS dni_norm
    FROM public.participants
    WHERE coalesce(data->>'dni', '') <> ''
    GROUP BY 1
    HAVING COUNT(*) > 1
  ) s;

  IF coalesce(dup_count, 0) = 0 THEN
    EXECUTE $idx$
      CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_dni_normalized
      ON public.participants (public.normalize_ve_cedula(data->>'dni'))
      WHERE coalesce(data->>'dni', '') <> ''
        AND public.normalize_ve_cedula(data->>'dni') IS NOT NULL
    $idx$;
    RAISE NOTICE '075: índice único de cédula creado (sin duplicados).';
  ELSE
    RAISE NOTICE '075: NO se crea índice único de cédula: % grupos duplicados (%). Resolver a mano y re-ejecutar.',
      dup_count, left(coalesce(dup_sample, ''), 200);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- Storage: fotos de ficha
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('player-photos', 'player-photos', true)
    ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

    BEGIN
      DROP POLICY IF EXISTS "player_photos_public_read" ON storage.objects;
      DROP POLICY IF EXISTS "player_photos_own_insert" ON storage.objects;
      DROP POLICY IF EXISTS "player_photos_own_update" ON storage.objects;
      CREATE POLICY "player_photos_public_read"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'player-photos');
      CREATE POLICY "player_photos_own_insert"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'player-photos'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
      CREATE POLICY "player_photos_own_update"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
          bucket_id = 'player-photos'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
    EXCEPTION WHEN undefined_table OR insufficient_privilege THEN
      RAISE NOTICE '075: no se pudieron crear políticas de storage.objects (revisar a mano).';
    END;
  END IF;
END $$;

COMMENT ON FUNCTION public.protect_profiles_privileged_columns() IS
  'Impide que un jugador se asigne role/admin o cambie unique_code/marker_canchas.';
COMMENT ON FUNCTION public.lookup_profile_by_unique_code(text) IS
  'Lookup de pareja por código de 6 caracteres: solo id y nombre visible.';
