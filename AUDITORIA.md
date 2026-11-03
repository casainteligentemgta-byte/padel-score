# Auditoría de la aplicación Padel Score

**Fecha:** 2026  
**Stack:** Next.js 16, React 19, Supabase (auth + datos + realtime).

---

## 1. Resumen ejecutivo

| Área            | Estado | Notas |
|-----------------|--------|--------|
| Auth (login UI) | ✅     | Supabase Auth bien integrado en cliente. |
| Auth (APIs)     | ✅     | APIs usan authServerSupabase (JWT Supabase + rol en profiles). |
| Datos           | ✅     | dataService migrado a Supabase (tournaments, profiles, etc.). |
| Firebase        | ✅     | Retirado. Marcador/TV/pizarra en Supabase Realtime. |
| Seguridad       | ✅     | Admin solo por rol; RLS documentado en supabase/RLS_REVISION.md. |
| Errores / UX    | ✅     | Error boundary, mensajes en español, loading, /test. |
| Dependencias    | ✅     | Firebase retirado; .env.example sin NEXT_PUBLIC_FIREBASE_*. |

---

## 2. Arquitectura actual

- **Cliente:** Next.js App Router, AuthContext con Supabase (getSupabaseClient), AppSettingsContext.
- **Auth:** Login/registro/cierre → Supabase Auth. Perfil de usuario → tabla `profiles` en Supabase.
- **Datos:** dataService usa solo Supabase (tournaments, tournament_matches, profiles, participants, etc.).
- **APIs protegidas:** `/api/insights`, `/api/tournaments`, `/api/ai`, `/api/matches/[id]` usan `requireAuth` / `requireRole` de **authServerSupabase**, que valida el JWT de Supabase y lee el rol desde la tabla `profiles`.
- **getAuthHeaders()** (apiAuth.ts): envía el token de sesión de Supabase (`supabase.auth.getSession()`). Las APIs validan ese token correctamente.

---

## 3. Seguridad

### 3.1 Crítico / importante

- **Admin por email fijo:** En `AuthContext.tsx`, `isAdmin` incluye `user?.email === 'casainteligentemgta@gmail.com'`. Conviene que el admin salga solo de `profile.role === ROLES.ADMIN` (o de una lista en env, no en código).
- **Admin en desarrollo:** `isAdmin || process.env.NODE_ENV === 'development'` hace que en dev cualquiera sea admin. Aceptable en local, pero no exponer builds “development” en producción.
- **APIs:** `requireAuth` valida JWT de Supabase. Sin token válido responde 401.

### 3.2 Buenas prácticas ya presentes

- Variables sensibles en env (Supabase URL/anon key, service role).
- authServer: fail-closed cuando se exige auth y no está configurado (500 en vez de dejar pasar).
- Validación de email/contraseña en cliente (authValidators) y mensajes de error claros (getAuthErrorMessage).

---

## 4. APIs y autenticación

| Ruta                      | Protección   | Origen del token | Comentario |
|---------------------------|-------------|-------------------|------------|
| GET/POST /api/tournaments | requireAuth | Supabase JWT      | authServerSupabase. |
| GET/PATCH /api/tournaments/[id] | requireAuth | Supabase JWT      | Igual. |
| GET /api/insights         | requireAuth | Supabase JWT      | |
| POST /api/ai              | requireAuth | Supabase JWT      | Igual. |
| PATCH /api/matches/[id]   | requireRole | Supabase JWT + profiles.role | Solo admin/marker. |

---

## 5. Capa de datos

- **dataService:** Correctamente migrado a Supabase (tournaments, tournament_matches, profiles, participants, groups, expenses, ads, inscriptions, admin_settings). Usa `getSupabaseClient()` y lanza si Supabase no está configurado al llamar métodos que lo necesitan.
- **getAdminSettings:** Devuelve `null` si no hay cliente Supabase (evita caídas en arranque).
- **Prisma:** Hay schema y `prisma.ts`; el dataService no lo usa. Decidir si se elimina o se usa para otra capa (ej. solo reportes o admin).
- **Pizarra / TV:** `pizarra_cancha_state` + Supabase Realtime. Firebase retirado.

---

## 6. UX y manejo de errores

- **RootErrorBoundary:** Captura errores y muestra mensaje + “Reintentar”.
- **global-error.tsx:** Página de fallo global con reset.
- **loading.tsx:** Pantalla de carga “Smart Padel”.
- **Ruta /test:** Útil para comprobar que Next responde.
- **Mensajes de login:** getAuthErrorMessage (credenciales, email no confirmado, etc.).
- **Banner estático en layout:** Ayuda a ver si el HTML llega cuando hay problemas de conexión.

---

## 7. Dependencias

- **firebase / firebase-admin / react-firebase-hooks:** retirados.
- **@supabase/supabase-js:** Correcto para auth y datos actuales.
- **Prisma + @prisma/client:** Sin uso en dataService; mantener solo si tienes plan para usarlos (o quitar para simplificar).

---

## 8. Recomendaciones prioritarias

1. **Unificar auth en APIs con Supabase** — ✅ Hecho: authServerSupabase + getAuthHeaders con token Supabase.

2. **Quitar admin hardcodeado** — ✅ Hecho: `isAdmin` solo usa `profile?.role === ROLES.ADMIN`.

3. **Documentar y revisar env**  
   - Local: al menos `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.  
   - Vercel: las mismas + en Supabase añadir la URL de Vercel en Redirect URLs / Site URL (ya indicado en VERCEL_Y_SUPABASE.md).  
   - No hace falta ninguna variable `FIREBASE_*`.

4. **Conexión local (“connection failed”)**  
   - Es un tema de red/servidor: solo un `npm run dev`, borrar `.next/dev/lock` si hace falta, y usar `http://localhost:3000` (y `/test` para comprobar). No es un fallo de la lógica de la app en sí.

5. **Limpieza** — ✅ Firebase y Prisma runtime retirados. Datos y realtime en Supabase.

---

## 9. Conclusión

La aplicación tiene **auth unificada en Supabase** (login UI + APIs con JWT y rol desde `profiles`), admin solo por rol, env documentado y RLS documentado en `supabase/RLS_REVISION.md`. Marcador, pizarra y TV usan `pizarra_cancha_state` + Realtime. Firebase ya no está en el proyecto.
