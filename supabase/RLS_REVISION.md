# Revisión RLS (Row Level Security) en Supabase

Esta guía describe el uso de las tablas desde la app y las políticas RLS recomendadas. Ejecuta el SQL en **Supabase → SQL Editor** (o como migración).

---

## 1. Tabla `profiles`

**Uso en la app:**
- **getUserProfile(uid)**: el usuario lee su propio perfil (id = auth.uid()).
- **setUserProfile(uid, data)**: el usuario actualiza su propio perfil; en admin, se podría actualizar el de otros.
- **listAllUsersProfile()**: solo la página Admin → Usuarios; debe poder listar todos los perfiles (solo si el usuario es admin).
- **authServerSupabase**: en las APIs, el servidor lee `role` del perfil enviando el JWT del usuario (equivale a “usuario leyendo su propia fila”).

**Columnas esperadas:** `id` (uuid, PK, referencia a auth.users), `role` (text), `name` (text), `email` (text, opcional), `marker_canchas` (text[] o jsonb), `created_at`, `updated_at`.

**Políticas necesarias:**
- **SELECT:** cada usuario puede leer su fila (`id = auth.uid()`); los admin pueden leer todas (usando una función que devuelva el rol del usuario actual).
- **INSERT:** solo la propia fila (`auth.uid() = id`), para crear el perfil al registrarse.
- **UPDATE:** cada usuario puede actualizar su fila; los admin pueden actualizar cualquier fila.

---

## 2. Tabla `admin_settings`

**Uso en la app:**
- **getAdminSettings()**: lo usa toda la app (p. ej. título). Se lee la fila con `id = 1`.
- **setAdminSettings()**: solo desde la página Admin → Ajustes; solo usuarios con rol admin.

**Políticas recomendadas:**
- **SELECT:** cualquier usuario autenticado (para que el título se muestre a todos).
- **UPDATE:** solo si el usuario actual es admin (usando la misma función de rol).

---

## 3. SQL a ejecutar en Supabase

Copia y ejecuta en **Supabase → SQL Editor**. Ajusta si ya tienes las tablas creadas (por ejemplo, solo añade políticas).

```sql
-- ============================================
-- 1. Función auxiliar: rol del usuario actual
-- ============================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================
-- 2. Tabla profiles (solo si no existe)
-- ============================================
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

-- Borrar políticas antiguas si las tienes y quieres reemplazarlas
-- DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
-- DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
-- DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;

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

-- ============================================
-- 3. Tabla admin_settings (solo si no existe)
-- ============================================
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

-- Políticas: todos los autenticados pueden leer; solo admin puede actualizar
CREATE POLICY "admin_settings_select_authenticated"
  ON public.admin_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_settings_update_admin"
  ON public.admin_settings FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- ============================================
-- 4. Trigger: crear perfil al registrarse (opcional)
-- ============================================
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
```

---

## 4. Cómo dar el primer admin

Con RLS activo, el primer usuario admin se suele asignar desde Supabase:

1. **Supabase → Table Editor → `profiles`**
2. Localiza la fila del usuario (mismo `id` que en **Authentication → Users**).
3. Edita el campo **`role`** y pon `admin`. Guarda.

Si no existe la fila (por ejemplo, el usuario se creó antes del trigger), créala con **Insert row**: `id` = UUID del usuario en Auth, `role` = `admin`, `name` y `email` si quieres.

---

## 5. Comprobar que todo va bien

- **Login y APIs:** al iniciar sesión, las rutas que usan `authServerSupabase` leen el rol desde `profiles`; si RLS permite `SELECT` donde `id = auth.uid()`, debería funcionar.
- **Admin → Usuarios:** si tu usuario tiene `role = 'admin'`, `listAllUsersProfile()` debe devolver todos los perfiles gracias a la política `profiles_select_own_or_admin`.
- **Admin → Ajustes:** solo con `role = 'admin'` se puede actualizar `admin_settings` por la política `admin_settings_update_admin`.

Si algo falla, revisa en **Supabase → Authentication → Policies** (o Table Editor → tabla → RLS) que las políticas anteriores estén creadas y que no haya otras que restrinjan más de lo necesario.

---

## 6. Otras tablas (tournaments, participants, etc.)

La app usa tablas con **owner_id** (dueño del recurso). Si activas RLS en ellas, aplica políticas por propietario y, si quieres, por admin.

**Requisito previo:** la función `get_my_role()` y la tabla `profiles` deben existir (bloque SQL de la sección 3).

### 6.1 Tablas con `owner_id`

Para **tournaments**, **participants**, **groups**, **expenses**, **ads**, **inscriptions** (cada una con columna `owner_id` uuid):

- **SELECT:** el usuario ve solo sus filas (`owner_id = auth.uid()`) o es admin (ve todo).
- **INSERT:** solo con `owner_id = auth.uid()`.
- **UPDATE / DELETE:** solo en filas propias o admin.

Ejemplo para una tabla (repite el patrón cambiando `tournaments` por el nombre de tabla):

```sql
-- Ejemplo: tournaments (repetir patrón para participants, groups, expenses, ads, inscriptions)
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tournaments_select_own_or_admin"
  ON public.tournaments FOR SELECT
  USING (owner_id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "tournaments_insert_own"
  ON public.tournaments FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "tournaments_update_own_or_admin"
  ON public.tournaments FOR UPDATE
  USING (owner_id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "tournaments_delete_own_or_admin"
  ON public.tournaments FOR DELETE
  USING (owner_id = auth.uid() OR public.get_my_role() = 'admin');
```

### 6.2 Tabla `tournament_matches`

No tiene `owner_id`; se relaciona por **tournament_id**. El permiso debe basarse en el torneo:

- **SELECT / INSERT / UPDATE / DELETE:** solo si el torneo asociado es del usuario o el usuario es admin.

```sql
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tournament_matches_all_own_or_admin"
  ON public.tournament_matches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments t
      WHERE t.id = tournament_matches.tournament_id
        AND (t.owner_id = auth.uid() OR public.get_my_role() = 'admin')
    )
  );
```

Si tu tabla se llama distinto o tiene otra clave (por ejemplo `tournament_id` en minúsculas), ajusta el nombre de la columna en el `EXISTS`.

### 6.3 Orden recomendado

1. Ejecutar primero el SQL de la sección 3 (profiles, admin_settings, get_my_role).
2. Comprobar login, APIs y primer admin.
3. Si quieres restringir el resto de datos por usuario, activar RLS en cada tabla y crear las políticas anteriores (una por tabla con owner_id, y la de tournament_matches).
