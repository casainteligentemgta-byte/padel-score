# Migracion a Vercel

Objetivo: desplegar Next.js en Vercel. Firebase ya no forma parte del producto (auth, datos y realtime van por Supabase).

## 1) Estrategia recomendada (cero riesgo)

1. No tocar DNS de produccion al inicio.
2. Levantar Vercel en paralelo con el mismo repo y rama `main`.
3. Validar flujos criticos en URL preview de Vercel.
4. Conectar un subdominio (`beta.tudominio.com`) y volver a validar.
5. Hacer cutover del dominio principal a Vercel.
6. Mantener el despliegue anterior 24-72h como rollback rapido.

## 2) Variables de entorno requeridas en Vercel

Copiar desde tu entorno productivo actual. No pegar secretos en cliente.

### Frontend/Publicas (prefijo `NEXT_PUBLIC_`)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (URL publica final, ejemplo `https://smartpadel.app`)
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` (si usan Storage)
- `NEXT_PUBLIC_SUPPORT_WHATSAPP` (opcional)
- `NEXT_PUBLIC_DEV_EMAIL` / `NEXT_PUBLIC_DEV_PASSWORD` (solo local; no en produccion)

### Backend/Privadas

- `SUPABASE_SERVICE_ROLE_KEY` (o `SUPABASE_SERVICE_KEY`, segun uso interno)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
- `ADMIN_ALERT_WHATSAPP` (opcional)
- `CEO_ALERT_WHATSAPP` (opcional)
- `DATABASE_URL` (si usan rutas con Prisma en produccion)
- `DIRECT_URL` (si aplica a Prisma)
- `LEGAL_BULK_EMAIL_SECRET` (si usan endpoint de legal masivo)
- `GROQ_API_KEY` (si usan `/api/ai`)
- `OPENROUTER_API_KEY` (si usan `/api/ai`)
- `BCV_VES_PER_USD` (opcional)

## 3) Checklist tecnico de migracion

## Paso A - Proyecto Vercel

- Crear proyecto nuevo desde GitHub (`casainteligentemgta-byte/padel-score`).
- Production Branch: `main`.
- Runtime Node: `22.x` (evita warnings de engine observados en deploy actual).
- Build command: `npm run build`.
- Install command: `npm install` (o el default de Vercel).

## Paso B - Configuracion Supabase Auth

En Supabase -> Authentication -> URL Configuration:

- Site URL: `https://TU_DOMINIO_O_VERCEL`
- Redirect URLs:
  - `https://TU_DOMINIO_O_VERCEL/**`
  - `http://localhost:3000/**`

## Paso C - Validacion funcional en preview

Validar como minimo:

1. Login/logout.
2. Registro de jugador.
3. Inscripcion de torneo (individual y pareja).
4. Confirmacion de pareja (`/accept-invite`).
5. Validacion de pagos en admin.
6. Endpoints de WhatsApp/Twilio.
7. Pago móvil / transferencia + validación admin (`/admin/validacion-pagos`).

## Paso D - Cutover de dominio

1. Agregar dominio en Vercel.
2. Configurar DNS (A/CNAME que indique Vercel).
3. Esperar SSL activo.
4. Confirmar que `NEXT_PUBLIC_APP_URL` coincide con dominio final.
5. Probar nuevamente rutas criticas.

## Paso E - Rollback rapido

Si algo falla tras el cutover:

1. Revertir DNS al destino anterior.
2. Confirmar restauracion.
3. Corregir en Vercel y repetir cutover.

## 4) Que ya no bloquea Blaze

Con Next.js sirviendo en Vercel:

- SSR y APIs corren en Vercel; datos y realtime en Supabase.

## 5) Tiempo estimado realista

- Preparacion + variables + primer preview: 1-2 horas.
- QA funcional principal: 2-4 horas.
- Cutover + monitoreo inicial: 1-2 horas.

Total tipico: 1 dia de trabajo (con margen para ajustes menores).
