-- Usuario y perfil fijos para pruebas: código 888888 / "Smart Padel Player Test"
-- Crea pgcrypto si hace falta, intenta fila en auth.users + auth.identities y luego public.profiles.
-- Si en tu proyecto auth.users no admite inserción vía SQL, crea en Dashboard un usuario y asigna id
-- 0f888888-8888-4888-8888-888888888888 + email test.smartplayer@smartpadel.local, luego re-ejecuta el bloque de profiles o corre solo el UPDATE al final.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unique_code TEXT;

DO $$
DECLARE
  v_id UUID := '0f888888-8888-4888-8888-888888888888';
  v_email TEXT := 'test.smartplayer@smartpadel.local';
  v_pw TEXT;
  auth_ok BOOLEAN := false;
BEGIN
  -- Si ya tenemos el perfil con código de prueba, alinear nombres
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_id) THEN
    UPDATE public.profiles
    SET
      name = 'Smart Padel Player Test',
      email = v_email,
      unique_code = '888888',
      updated_at = now()
    WHERE id = v_id
      AND (unique_code IS DISTINCT FROM '888888' OR name IS DISTINCT FROM 'Smart Padel Player Test' OR email IS DISTINCT FROM v_email);
  END IF;

  -- Crear en auth (solo si no existe)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_id) THEN
    v_pw := crypt('Test888888!NotForProd', gen_salt('bf'));
    BEGIN
      INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      ) VALUES (
        v_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        v_email,
        v_pw,
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now()
      );
      auth_ok := true;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '054_test_partner: auth insert omitido: %', SQLERRM;
    END;
  ELSE
    auth_ok := true;
  END IF;

  -- Identidad email
  IF auth_ok AND NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_id AND provider = 'email') THEN
    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        v_id,
        jsonb_build_object('sub', v_id::text, 'email', v_email),
        'email',
        v_id::text,
        now(),
        now(),
        now()
      );
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '054_test_partner: auth.identities omitido: %', SQLERRM;
    END;
  END IF;

  -- Perfil
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_id) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = v_id) THEN
    INSERT INTO public.profiles (id, role, name, email, unique_code, created_at, updated_at)
    VALUES (v_id, 'player', 'Smart Padel Player Test', v_email, '888888', now(), now())
    ON CONFLICT (id) DO UPDATE
    SET
      name = 'Smart Padel Player Test',
      email = EXCLUDED.email,
      unique_code = '888888',
      updated_at = now();
  END IF;
END $$;
