# Staging en Vercel (padel-score-mgti)

Dos proyectos, un repositorio:

| Proyecto Vercel | Rama | Uso | URL típica |
|-----------------|------|-----|------------|
| **padel-score** | `main` | Producción (club, TVs, jugadores) | `https://smartpadel58.com` |
| **padel-score-mgti** | `staging` | Pruebas antes de publicar | `https://padel-score-mgti.vercel.app` |

## 1. Conectar ramas en Vercel

### padel-score (producción)
1. [vercel.com](https://vercel.com) → proyecto **padel-score**
2. **Settings → Git**
3. **Production Branch:** `main`
4. Dominio: `smartpadel58.com`

### padel-score-mgti (pruebas)
1. Proyecto **padel-score-mgti**
2. **Settings → Git**
3. **Production Branch:** `staging` (no `main`)
4. Sin dominio principal del club (solo `*.vercel.app` o opcional `beta.smartpadel58.com`)

## 2. Variables de entorno

Copia las de producción en **padel-score-mgti** y ajusta:

| Variable | padel-score | padel-score-mgti |
|----------|-------------|------------------|
| `PADEL_DEPLOYMENT_TIER` | `production` | `staging` |
| `NEXT_PUBLIC_APP_URL` | `https://smartpadel58.com` | `https://padel-score-mgti.vercel.app` |

El resto (Supabase, Telegram, Resend, etc.) puede ser **igual** para pruebas rápidas, o usar un proyecto Supabase aparte si quieres no tocar datos reales.

## 3. Supabase (si pruebas login en staging)

**Authentication → URL Configuration → Redirect URLs**, añadir:

```
https://padel-score-mgti.vercel.app/**
```

## 4. Flujo de trabajo

```bash
# Desarrollo en staging
git checkout staging
# ... cambios ...
git add . && git commit -m "feat: ..."
git push origin staging
# → despliega solo padel-score-mgti

# Cuando esté listo para el club
git checkout main
git merge staging
git push origin main
# → despliega solo padel-score (producción)
```

## 5. Crons y Telegram

El informe diario Express (`/api/cron/express-daily-report`) **solo corre en producción**.

En staging responde `{ skipped: true }` para no duplicar mensajes a Telegram.

Detección automática si la URL contiene `mgti` o si `PADEL_DEPLOYMENT_TIER=staging`.

## 6. Express TV en pruebas

Las pantallas del club deben seguir en **smartpadel58.com** (producción).

Para probar una TV en staging, abre manualmente:

```
https://padel-score-mgti.vercel.app/display/express/scan-go-1?complex=El%20Bodeguero
```

⚠️ Con la misma base Supabase, cambios en staging pueden verse en datos compartidos.

## 7. Crear la rama staging (una vez)

```bash
git checkout main
git pull origin main
git checkout -b staging
git push -u origin staging
```
