# Módulo Americano (staging)

Desarrollo en rama **`staging`** → despliega en **padel-score-mgti**.

Producción (`main` / smartpadel58.com) **no** incluye este módulo hasta merge explícito.

## Estado actual

| Pieza | Ruta / archivo | Estado |
|-------|----------------|--------|
| Tipos schedule | `src/types/americano.ts` | ✅ |
| Lógica + tipos sesión | `src/lib/americano/logic.ts` | ✅ |
| Presets puntos (16–40) | `src/lib/americano/pointsPresets.ts` | ✅ |
| Motor rotaciones | `rotationEngine.ts` → `generateRotativeRotation` | ✅ |
| BD Supabase | `supabase/migrations/072_americano_sessions.sql` | ✅ (aplicar en Supabase) |
| Server actions | `src/app/actions/americanoActions.ts` | ✅ |
| Realtime TV | `src/lib/americano/useAmericanoRealtime.ts` | ✅ |
| UI laboratorio | `/americano` | ✅ |
| Control admin | `/americano/session/[sessionId]` | ✅ |
| Pantalla TV | `/americano/tv/[sessionId]` | ✅ |
| Marcador táctil por cancha | `/americano/marker/[sessionId]/[courtNumber]` | ✅ |
| TV con marcador en vivo | `/americano/tv/[sessionId]?court=N` | ✅ |
| Export PDF cuadrante | `americanoSchedulePdf.ts` + botones en lab y control | ✅ |
| Ranking acumulado | leaderboard + puntos por partido | ✅ |
| Integración torneos legacy | `AMERICANO_INDIVIDUAL` en ScheduleEngine + puente `tournament_id` | ✅ (rama staging) |

**Aislamiento:** no modifica `expressScoring.ts`, `express_matches` ni el flujo Express de canchas.

## Probar en staging

1. **Aplicar migraciones en Supabase** (una sola vez, ver sección siguiente).
2. Laboratorio: `https://padel-score-mgti.vercel.app/americano`
3. Crear sesión → control → abrir TV desde el panel.

## Migración Supabase (obligatoria)

El módulo **no funciona** sin estas tablas y funciones. Ejecutar **en el mismo proyecto** que usa staging (`NEXT_PUBLIC_SUPABASE_URL` en Vercel).

### Opción A — Un solo script (recomendado)

1. [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **SQL Editor** → **New query**
2. Copiar y pegar el contenido de `scripts/apply-americano-migrations.sql`
3. **Run** (debe terminar sin errores)
4. Al final del script verás listadas 3 tablas (`americano_sessions`, `americano_players`, `americano_matches`) y 3 funciones RPC

### Opción B — Archivos por separado

En el mismo SQL Editor, ejecutar **en orden**:

1. `supabase/migrations/072_americano_sessions.sql`
2. `supabase/migrations/073_americano_tournament_bridge.sql`
3. `supabase/migrations/074_americano_rls_and_correction.sql`

### Comprobar que quedó bien

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'americano_%';

SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%americano%';
```

Debes ver **3 tablas** y **3 funciones** (`submit_americano_match_result`, `recalculate_americano_session_points`, `correct_americano_match_result`).

### Si ya ejecutaste solo la 072

Ejecuta solo `073` y `074` (o el script completo: usa `IF NOT EXISTS` y es idempotente en tablas).

URLs:

- Control: `/americano/session/{uuid}`
- Marcador táctil: `/americano/marker/{uuid}/{cancha}` (ej. cancha 1, 2…)
- TV: `/americano/tv/{uuid}` · TV cancha: `?court=1&complex=...`

## Flujo de trabajo

```bash
git checkout staging
# desarrollar...
git push origin staging   # solo mgti

git checkout main
git merge staging
git push origin main      # producción cuando esté listo
```

## Roadmap restante

- [x] Parejas más equilibradas (social golfer greedy v2)
- [x] Auth en server actions + RLS lectura pública
- [x] Corrección de resultados + recálculo de puntos
- [x] Podio / informe Telegram al cerrar sesión
- [x] Marcador táctil por cancha
- [x] Exportar PDF del cuadrante (descarga + compartir nativo en móvil)
- [x] Compartir WhatsApp dedicado (PDF en móvil; texto + enlace en escritorio)

## Export PDF

- Generador: `src/lib/americano/americanoSchedulePdf.ts` (jsPDF + autoTable).
- Botones **PDF** / **Compartir** / **WhatsApp** en `/americano` (preview) y en `/americano/session/{id}` (con resultados y clasificación en vivo).
- En móvil, **Compartir** y **WhatsApp** usan Web Share API con el archivo PDF.
- En escritorio, **WhatsApp** descarga el PDF y abre `wa.me` con resumen del cuadrante y enlace al control.

## Algoritmo de rotación (v2)

`generateRotativeRotation` → **social golfer greedy** (`socialGolfer.ts`): parejas más equilibradas que la rotación circular v1.  
Cada jugador suma los puntos de su lado en cada partido terminado.
