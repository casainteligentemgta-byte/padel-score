/**
 * Edge Function (opcional): envío del dossier por email con Resend.
 * En producción puedes invocarla con el JWT del admin; la app ya expone
 * `POST /api/admin/send-dossier-email` en Vercel con la misma lógica.
 *
 * Variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
 * RESEND_API_KEY, RESEND_FROM_EMAIL
 *
 * Body JSON: { "to": "cliente@club.com", "recipientName": "Nombre" }
 * Header: Authorization: Bearer <access_token del usuario admin>
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const from = Deno.env.get("RESEND_FROM_EMAIL") ?? "Smart Padel <onboarding@resend.dev>";

  if (!supabaseUrl || !anonKey || !serviceKey || !resendKey) {
    return new Response(JSON.stringify({ error: "Missing env" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data: { user }, error: userErr } = await userClient.auth.getUser(jwt);
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = String(profile?.role || "").toLowerCase();
  if (role !== "admin") {
    return new Response(JSON.stringify({ error: "Admin only" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { to?: string; recipientName?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const to = String(body.to || "").trim().toLowerCase();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: row } = await admin.from("admin_settings").select("publicidad_dossier_drive_id").eq("id", 1).maybeSingle();
  const folderId = String((row as { publicidad_dossier_drive_id?: string } | null)?.publicidad_dossier_drive_id || "")
    .trim();
  if (!folderId) {
    return new Response(JSON.stringify({ error: "Dossier not configured" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const dossierUrl = `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}`;
  const recipientName = String(body.recipientName || "Hola").trim();

  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;background:#050505;color:#fafafa;font-family:sans-serif;padding:24px;">
  <div style="max-width:560px;margin:0 auto;border:1px solid rgba(204,255,0,0.35);border-radius:18px;padding:28px;background:rgba(12,12,12,0.96);">
    <p style="color:#ccff00;font-size:11px;letter-spacing:0.14em;font-weight:700;">SMART PADEL · VENTAS</p>
    <h1 style="font-size:22px;font-style:italic;margin:0 0 14px;">${recipientName}, aquí tienes el dossier</h1>
    <p style="color:#a1a1aa;line-height:1.65;font-size:15px;">Material comercial y referencias para llevar Smart Padel a tu club.</p>
    <p style="margin:24px 0;"><a href="${dossierUrl}" style="background:#ccff00;color:#050505;padding:14px 28px;border-radius:999px;font-weight:800;text-decoration:none;display:inline-block;">Abrir dossier en Drive</a></p>
    <p style="color:#71717a;font-size:11px;">${dossierUrl}</p>
  </div>
</body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Smart Padel — Dossier comercial para tu club",
      html,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    return new Response(JSON.stringify({ error: t || "Resend error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
