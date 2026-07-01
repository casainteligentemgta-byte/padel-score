# Módulo Americano (staging)

Desarrollo en rama **`staging`** → despliega en **padel-score-mgti**.

Producción (`main` / smartpadel58.com) **no** incluye este módulo hasta merge explícito.

## Estado actual (MVP)

| Pieza | Ruta / archivo | Estado |
|-------|----------------|--------|
| Tipos | `src/types/americano.ts` | ✅ |
| Presets puntos (16–40) | `src/lib/americano/pointsPresets.ts` | ✅ |
| Motor rotaciones | `src/lib/americano/rotationEngine.ts` | ✅ MVP |
| UI laboratorio | `/americano` | ✅ |
| BD / Supabase | — | Pendiente |
| Marcador por partido | — | Pendiente |
| Ranking acumulado | — | Pendiente |
| Integración torneos | parcial vía `AMERICANO_INDIVIDUAL` existente | Legacy |

## Probar en staging

```
https://padel-score-mgti.vercel.app/americano
```

## Flujo de trabajo

```bash
git checkout staging
# desarrollar...
git push origin staging   # solo mgti

git checkout main
git merge staging
git push origin main      # producción cuando esté listo
```

## Roadmap

### Fase 1 — Generador (actual)
- [x] Config: jugadores, canchas, puntos
- [x] Cuadrante de rondas con descansos
- [ ] Exportar PDF / compartir WhatsApp

### Fase 2 — Sesión en BD
- [ ] Tabla `americano_sessions` + jugadores + rondas
- [ ] Admin crea evento y guarda fixture

### Fase 3 — Marcador
- [ ] Partido a N puntos (como Express pero americano)
- [ ] Suma individual de puntos por jugador

### Fase 4 — Ranking y cierre
- [ ] Clasificación en vivo
- [ ] Podio / informe Telegram

## Relación con código existente

- `TournamentType.AMERICANO_INDIVIDUAL` en torneos clásicos (`/admin/master-generator`)
- Este módulo apunta a un **flujo dedicado** más simple que el wizard de torneo completo

## Algoritmo de rotación (v1)

Rotación circular de jugadores + bloques de 4 por cancha.  
Mejoras futuras: parejas más equilibradas (social golfer / partner matrix).
