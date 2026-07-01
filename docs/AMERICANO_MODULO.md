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
| Ranking acumulado | leaderboard + puntos por partido | ✅ |
| Integración torneos legacy | `AMERICANO_INDIVIDUAL` en ScheduleEngine + puente `tournament_id` | ✅ (rama staging) |

**Aislamiento:** no modifica `expressScoring.ts`, `express_matches` ni el flujo Express de canchas.

## Probar en staging

1. Aplicar migraciones `072`, `073` y `074` en Supabase (staging/prod según entorno).
2. Laboratorio: `https://padel-score-mgti.vercel.app/americano`
3. Crear sesión → control → abrir TV desde el panel.

URLs:

- Control: `/americano/session/{uuid}`
- TV: `/americano/tv/{uuid}` (publicidad vía `ExpressTvPublicidadDock` + sede del evento)

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
- [ ] Exportar PDF / compartir WhatsApp del cuadrante
- [ ] Marcador táctil por cancha (opcional; hoy se cargan resultados en el panel)

## Algoritmo de rotación (v1)

`generateRotativeRotation`: rotación circular + bloques de 4 por cancha.  
Cada jugador suma los puntos de su lado en cada partido terminado.
