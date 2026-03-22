# Edge Function: send-welcome-email

La función **send-welcome-email** envía un correo de bienvenida cuando se inserta un nuevo registro en la tabla `profiles`, usando la API de Resend.

## Requisitos

- Cuenta en [Resend](https://resend.com) y API Key.
- Proyecto Supabase con Edge Functions habilitadas.

## Secretos de la función

Configura en Supabase (Dashboard → Edge Functions → send-welcome-email → Secrets) o con CLI:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxx
supabase secrets set RESEND_FROM_EMAIL="Smart Padel <noreply@tudominio.com>"   # opcional
supabase secrets set APP_URL=https://www.smartpadel58.com   # opcional, para el enlace /mi-cuenta
```

- **RESEND_API_KEY** (obligatorio): API key de Resend.
- **RESEND_FROM_EMAIL** (opcional): Remitente del correo. Por defecto usa `Smart Padel <onboarding@resend.dev>`.
- **APP_URL** (opcional): URL base de la app. Por defecto `https://www.smartpadel58.com`. El botón del correo apunta a `{APP_URL}/mi-cuenta`.

## Despliegue

```bash
supabase functions deploy send-welcome-email
```

## Activar el webhook en la tabla `profiles`

1. En **Supabase Dashboard** → **Database** → **Webhooks**.
2. **Create a new hook**.
3. Configuración:
   - **Name:** p. ej. `profiles-insert-welcome-email`
   - **Table:** `profiles`
   - **Events:** marcar **Insert**
   - **Type:** **Supabase Edge Functions**
   - **Edge Function:** `send-welcome-email`
4. Guardar.

El webhook enviará a la función un payload con `type: 'INSERT'`, `table: 'profiles'` y `record` (incluye `email`, `name`, etc.). La función usa `record.email` como destinatario y opcionalmente `record.name` en el saludo.

## Comportamiento

- Solo actúa si el body del request es un evento **INSERT** en la tabla **profiles**.
- Si `record.email` no existe o no es válido, responde 200 con `skipped: true` y no envía correo.
- El asunto del correo es: *¡Bienvenido a Smart Padel - Tu nueva era en la pista!*
- El correo incluye un botón **"Completar mi perfil"** que enlaza a `{APP_URL}/mi-cuenta`.
