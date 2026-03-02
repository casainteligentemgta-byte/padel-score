# Cron: check-screen-status cada 5 minutos

## 1. Desplegar la Edge Function

```bash
supabase functions deploy check-screen-status
```

## 2. Secret: URL de tu app (para llamar a la API de WhatsApp)

La función llama a `ALERTS_API_URL/api/alerts/whatsapp`. Configura la URL de tu app (con https, sin barra final):

```bash
supabase secrets set ALERTS_API_URL=https://tu-dominio.vercel.app
```

(O en Dashboard: Project Settings → Edge Functions → Secrets.)

## 3. Programar ejecución cada 5 minutos

### Opción A: Supabase Dashboard (pg_cron)

1. En Supabase: **Database** → **Extensions** → activar **pg_cron**.
2. **SQL Editor** → ejecutar:

```sql
SELECT cron.schedule(
  'check-screen-status-every-5min',
  '*/5 * * * *',  -- cada 5 minutos
  $$
  SELECT net.http_post(
    url := 'https://<TU_PROYECTO>.supabase.co/functions/v1/check-screen-status',
    headers := '{"Authorization": "Bearer <TU_ANON_KEY>"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

Sustituye `<TU_PROYECTO>` y `<TU_ANON_KEY>` por tu proyecto y la clave anon (o service_role si la función lo requiere).

### Opción B: Servicio externo (Vercel Cron, etc.)

Crea un cron en tu plataforma que haga un `POST` o `GET` cada 5 minutos a:

```
https://<TU_PROYECTO>.supabase.co/functions/v1/check-screen-status
```

Con header `Authorization: Bearer <TU_ANON_KEY>`.

## 4. Variables en tu app Next.js (.env.local)

Para que `/api/alerts/whatsapp` funcione cuando la Edge Function la llame:

```
WHATSAPP_TOKEN=tu_token_whapi
WHATSAPP_NUMERO=58412XXXXXXX
```

## 5. Actualizar last_seen desde la pantalla

En la vista `/display/[id]` debes hacer un “heartbeat” periódico (por ejemplo cada 60 s) para actualizar `pantallas.last_seen` y `activa = true` cuando la pantalla esté abierta. Así la función solo marcará como caídas las que dejen de enviar el heartbeat.
