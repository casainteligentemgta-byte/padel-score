# Migración Firebase → Supabase

Resumen de lo implementado para centralizar Auth y Realtime en Supabase y eliminar la dependencia de Firebase donde ya hay reemplazo.

## Completado

### 1. Auth
- **AuthContext** ya usaba solo Supabase Auth (`supabase.auth.onAuthStateChange`, `signInWithPassword`, `signInWithOAuth`). No se tocó.
- **APIs**: todas las rutas protegidas usan `authServerSupabase` (getAuthUser, requireAuth, requireRole). No se usa `authServer.ts` (Firebase Admin) en ninguna ruta.

### 2. Realtime – Partidos y torneo
- **useMatchRealtime**: reescrito para usar `dataService.getTournament`, `dataService.getMatches`, `dataService.subscribeToTournament`, `dataService.subscribeToMatches` y `dataService.updateMatch` (Supabase Realtime sobre `tournaments` y `tournament_matches`). Ya no usa Firestore.
- **Página score** (`/tournaments/[id]/score/[matchId]`): eliminados `ref`/`onValue`/`update` de RTDB y `doc`/`onSnapshot`/`updateDoc` de Firestore. Usa solo dataService y sincroniza el marcador con `pizarra_cancha_state` para displays por cancha.
- **Página display** (`/tournaments/[id]/display/[matchId]`): eliminados RTDB y Firestore. Usa `dataService.subscribeToTournament`, `subscribeToMatches` y `subscribePizarraCanchaState` para marcador en vivo y animación.

### 3. Rol y perfil
- **useRTDBRole**: ahora lee desde el perfil de Supabase (AuthContext: `profile.role`, `profile.markerCanchas`). Misma interfaz `RTDBUserRole` para no romper componentes.
- **Admin usuarios**: eliminadas las llamadas a `rtdbService.setRTDBUserRole`. Solo se usa `dataService.setUserProfile` (Supabase `profiles`).

### 4. Pizarra / cancha (marcador)
- **Tabla** `pizarra_cancha_state` (migración `008_pizarra_cancha_state.sql`): `cancha_id` (PK), `data` (JSONB), `updated_at`.
- **dataService**: `getPizarraCanchaState`, `setPizarraCanchaState`, `subscribePizarraCanchaState`.
- **Página marker** (`/marker/[canchaId]`): deja de usar `rtdbService` y `rtdb`; usa solo dataService y Supabase Realtime sobre `pizarra_cancha_state`.
- **Animaciones marcador**: `dataService.setAnimacionMarcador(animId, data)` escribe en `match_animations` (reemplazo de RTDB `publicidad_master/animaciones_marcador`). Admin publicidad usa este método.

### 5. Otros
- **useAdBanner**: ya no usa RTDB. Devuelve estado por defecto (modo fija, sin URL). Se puede conectar después a una tabla Supabase de publicidad si se desea.
- **Admin publicidad**: usa `dataService.setAnimacionMarcador` en lugar de `rtdbService.setAnimacionMarcador`.

## Archivos que siguen usando Firebase

Estos archivos siguen importando `firebase/*` o `@/lib/firebase` / `@/lib/rtdb` / `@/lib/rtdbService`. Para terminar la migración hay que sustituirlos por Supabase o por stubs:

- `src/app/tournaments/[id]/control/broadcasting/page.tsx` – Firestore
- `src/app/tournaments/[id]/stream/[matchId]/page.tsx` – Firestore
- `src/app/tournaments/event/components/RulesView.tsx` – Firestore
- `src/app/tournaments/[id]/control/ads/page.tsx` – Firestore, RTDB, Storage
- `src/app/dev/simulate-tournament/page.tsx` – Firestore
- `src/app/display/stream/court/[courtId]/page.tsx` – Firestore
- `src/app/tournaments/[id]/monitor/page.tsx` – Firestore
- `src/app/live/page.tsx` – Firestore
- `src/app/tournaments/[id]/control/page.tsx` – Firestore
- `src/app/display/court/[courtId]/page.tsx` – RTDB
- `src/app/tournaments/[id]/pre-match/[matchId]/page.tsx` – Firestore
- `src/app/tv/page.tsx` – Firestore
- `src/app/display/tv/[courtId]/page.tsx` – Firestore
- `src/lib/ragService.ts` – Firestore
- `src/lib/systemMonitor.ts` – Firestore
- `src/app/api/insights/route.ts` – Firestore
- `src/scripts/simulate.ts` – Firestore

## Archivos de configuración Firebase

- `src/lib/firebase.ts` – config y exports de app, auth, db, storage (siguen siendo usados por los archivos de la lista anterior).
- `src/lib/rtdb.ts` – inicialización de Realtime Database (usado por los que aún dependen de RTDB).
- `src/lib/rtdbService.ts` – funciones de canchas, publicidad, roles en RTDB; parcialmente reemplazadas por dataService; aún importado por algunos de los archivos listados.

Cuando ningún archivo use Firebase, se pueden eliminar o vaciar `firebase.ts`, `rtdb.ts` y `rtdbService.ts` (o sustituirlos por stubs que exporten `null`/no-ops).

## Cómo probar

1. Aplicar la migración SQL en Supabase: `008_pizarra_cancha_state.sql`.
2. Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (y `SUPABASE_SERVICE_ROLE_KEY` donde haga falta). Ya no es obligatorio tener configurado Firebase para login, marcador, pizarra ni admin de usuarios/publicidad según lo migrado.
3. Flujos a comprobar: login (Supabase), marcador por cancha (pizarra_cancha_state), score de partido (tournament_matches + sync a pizarra), display por partido (Supabase Realtime), admin usuarios (solo Supabase profiles).
