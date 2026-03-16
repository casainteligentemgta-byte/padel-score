// Supabase Edge Function: send-welcome-email
// Se invoca con un Database Webhook al insertar en la tabla profiles.
// Envía un correo de bienvenida vía Resend con enlace a /mi-cuenta.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "Smart Padel <onboarding@resend.dev>";
const APP_URL = Deno.env.get("APP_URL") ?? "https://www.smartpadel58.com";

const SUBJECT = "¡Bienvenido a Smart Padel - Tu nueva era en la pista!";

interface WebhookPayload {
  type?: string;
  table?: string;
  record?: Record<string, unknown>;
  schema?: string;
}

function buildWelcomeHtml(profileUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Smart Padel</title>
</head>
<body style="margin:0; padding:0; font-family: sans-serif;">
<div style="background-color: #0a0a0a; color: white; padding: 40px; font-family: sans-serif; text-align: center; border-radius: 20px;">
  <h1 style="color: #ccff00; font-style: italic;">¡BIENVENIDO A SMART PADEL!</h1>
  <p style="font-size: 18px; color: #ffffffcc;">Estás a un paso de vivir el pádel a otro nivel.</p>
  
  <div style="background: rgba(255,255,255,0.05); border: 1px solid #ccff00; padding: 20px; border-radius: 15px; margin: 30px 0; text-align: left;">
    <h3 style="color: #ccff00;">Próximos pasos obligatorios:</h3>
    <ul style="color: #ffffffcc; line-height: 1.6;">
      <li>✅ <b>Completa tu perfil:</b> Sube tu foto para tu Player Card.</li>
      <li>🆔 <b>Tu Código:</b> En tu Hub encontrarás tu código de 6 dígitos para invitar a compañeros.</li>
      <li>🎾 <b>Inscríbete:</b> Busca torneos abiertos y asegura tu lugar en la grilla.</li>
    </ul>
  </div>

  <a href="${profileUrl}" style="background-color: #ccff00; color: black; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
    CONFIGURAR MI PERFIL
  </a>
  
  <p style="margin-top: 40px; font-size: 12px; color: #666;">
    © 2026 Smart Padel 58 - La tecnología al servicio del deporte.
  </p>
</div>
</body>
</html>
`.trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!RESEND_API_KEY) {
    console.error("send-welcome-email: RESEND_API_KEY is not set");
    return new Response(
      JSON.stringify({ ok: false, error: "RESEND_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let payload: WebhookPayload = {};
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (payload.table !== "profiles" || payload.type !== "INSERT" || !payload.record) {
    return new Response(
      JSON.stringify({ ok: true, skipped: true, reason: "Not a profiles INSERT event" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const record = payload.record as Record<string, unknown>;
  const email = typeof record.email === "string" ? record.email.trim() : null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(
      JSON.stringify({ ok: true, skipped: true, reason: "No valid email in record" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const profileUrl = `${APP_URL.replace(/\/$/, "")}/mi-cuenta`;
  const html = buildWelcomeHtml(profileUrl);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [email],
        subject: SUBJECT,
        html,
      }),
    });

    const data = (await res.json()) as { id?: string; message?: string; error?: string };
    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(
        JSON.stringify({ ok: false, error: data?.message ?? data?.error ?? "Resend request failed" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, messageId: data?.id, to: email }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-welcome-email:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
