# Migración Firebase → Supabase

**Estado: completada.** Firebase (Auth, RTDB, Firestore, Storage, Admin SDK) ya no está en el código ni en las dependencias. Auth, datos, storage, RAG y realtime (marcador, pizarra, TV, animaciones) van por Supabase.

## Qué usa cada flujo ahora

- **Login / roles:** Supabase Auth + `profiles`.
- **Marcador / pizarra / TV:** `pizarra_cancha_state` + `subscribePizarraCanchaState` (postgres_changes).
- **Animaciones de marcador:** `pizarra_cancha_state.data.animacion_actual`.
- **Publicidad:** `media_content` / `cancha_publicidad`; el carrusel del panel de torneo se guarda en `tournaments.data.broadcastingSettings`.
- **Comprobantes y media:** Supabase Storage.
- **RAG de agentes:** tabla `knowledge_base`.

## Cómo probar

1. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. En Vercel se pueden borrar todas las `NEXT_PUBLIC_FIREBASE_*` y `FIREBASE_SERVICE_ACCOUNT_KEY`.
3. Flujos: login, marcador (`/tournaments/[id]/score/...` y `/marker/[canchaId]`), display/TV, admin usuarios.
