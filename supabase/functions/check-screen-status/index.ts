// Edge Function: check-screen-status
// Ejecutar cada 5 minutos (Cron). Compara NOW() con last_seen en pantallas.
// Si last_seen > 180 s atrás y pantalla está activa → POST a API WhatsApp y marcar pantalla como caída.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALERTS_API_URL = Deno.env.get("ALERTS_API_URL") ?? ""; // URL de tu app Next.js (ej. https://tu-app.vercel.app)
const LIMITE_SEGUNDOS = 180; // 3 minutos

interface PantallaRow {
  id: string;
  nombre: string;
  ubicacion: string | null;
  activa: boolean;
  last_seen: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const limiteDate = new Date(Date.now() - LIMITE_SEGUNDOS * 1000).toISOString();

  // Pantallas activas cuyo last_seen es anterior a (now - 180 s)
  const { data: pantallas, error: queryError } = await supabase
    .from("pantallas")
    .select("id, nombre, ubicacion, activa, last_seen")
    .eq("activa", true)
    .lt("last_seen", limiteDate);

  if (queryError) {
    console.error("check-screen-status query error:", queryError);
    return new Response(
      JSON.stringify({ ok: false, error: queryError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const filas = (pantallas ?? []) as PantallaRow[];
  const resultados: { id: string; nombre: string; alertaEnviada: boolean }[] = [];

  for (const p of filas) {
    let alertaEnviada = false;
    if (ALERTS_API_URL) {
      try {
        const r = await fetch(`${ALERTS_API_URL.replace(/\/$/, "")}/api/alerts/whatsapp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pantallaNombre: p.nombre,
            ubicacion: p.ubicacion ?? "Pampatar",
          }),
        });
        alertaEnviada = r.ok;
        if (!r.ok) console.error("WhatsApp API error:", await r.text());
      } catch (e) {
        console.error("fetch WhatsApp API:", e);
      }
    }

    await supabase.from("pantallas").update({ activa: false }).eq("id", p.id);
    resultados.push({ id: p.id, nombre: p.nombre, alertaEnviada });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      pantallasCaidas: resultados.length,
      resultados,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
