/**
 * Smart-Legal — Notificación masiva al cambiar `admin_settings.terms_version`.
 *
 * Despliegue sugerido:
 * 1. Database Webhook (Supabase) en UPDATE de `public.admin_settings` filtrando `record.terms_version <> old_record.terms_version`.
 * 2. O cron que procese `terms_notification_jobs` con status = pending.
 *
 * Variables de entorno: RESEND_API_KEY, RESEND_FROM_EMAIL (o SendGrid equivalentes).
 *
 * Este archivo es un esqueleto: implementa el batch a perfiles activos y el envío real.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type WebhookPayload = {
  type: "UPDATE";
  table: string;
  schema: string;
  record: { id?: number; terms_version?: string };
  old_record?: { terms_version?: string };
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "POST only" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: WebhookPayload;
  try {
    body = (await req.json()) as WebhookPayload;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), { status: 400 });
  }

  if (body.table !== "admin_settings" || body.type !== "UPDATE") {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const fromV = body.old_record?.terms_version ?? "";
  const toV = body.record?.terms_version ?? "";
  if (!toV || fromV === toV) {
    return new Response(JSON.stringify({ ok: true, skipped: true, reason: "same version" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) {
    return new Response(JSON.stringify({ ok: false, error: "Missing Supabase env" }), { status: 500 });
  }

  const admin = createClient(url, key);
  const { error: jobErr } = await admin.from("terms_notification_jobs").insert({
    from_version: fromV || null,
    to_version: toV,
    status: "pending",
  });
  if (jobErr) {
    console.error("[notify-terms-version-change] job insert", jobErr);
    return new Response(JSON.stringify({ ok: false, error: jobErr.message }), { status: 500 });
  }

  // TODO: leer perfiles con email, enviar con Resend en lotes, marcar job processed.

  return new Response(
    JSON.stringify({ ok: true, enqueued: true, from_version: fromV, to_version: toV }),
    { headers: { "Content-Type": "application/json" } },
  );
});
