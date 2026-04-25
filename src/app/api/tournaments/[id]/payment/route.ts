import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authServerSupabase';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

type PaymentReportBody = {
    bankOrigin?: string;
    phoneEmitter?: string;
    amountBs?: number | string;
    referenceNumber?: string;
};

function normalizeRef(input: string): string {
    return String(input || '').replace(/\D+/g, '').trim();
}

function normalizePhone(input: string): string {
    // Guardamos la “forma” del usuario, pero recortamos espacios para consistencia.
    return String(input || '').trim();
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.uid;

    const { id: tournamentId } = await params;
    if (!tournamentId) return NextResponse.json({ error: 'ID de torneo requerido' }, { status: 400 });

    let body: PaymentReportBody = {};
    try {
        body = (await req.json()) ?? {};
    } catch {
        return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
    }

    const bankOrigin = String(body.bankOrigin ?? '').trim();
    const phoneEmitter = normalizePhone(String(body.phoneEmitter ?? ''));
    const referenceNumber = normalizeRef(String(body.referenceNumber ?? ''));
    const amountBs =
        body.amountBs === undefined || body.amountBs === null || body.amountBs === ''
            ? null
            : Number(String(body.amountBs).replace(',', '.'));

  if (!bankOrigin) return NextResponse.json({ error: 'Banco de origen requerido' }, { status: 400 });
  if (!/^\d{3,}$/.test(referenceNumber)) return NextResponse.json({ error: 'Número de referencia inválido (mínimo 3 dígitos)' }, { status: 400 });
    if (amountBs == null || !Number.isFinite(amountBs) || amountBs <= 0) {
        return NextResponse.json({ error: 'Monto en Bs requerido y debe ser > 0' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json({ error: 'Configuración del servidor: falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 501 });
    }

    // 1) Bloqueo estricto: referencia ya utilizada?
    const { data: existing, error: existingErr } = await supabase
        .from('payment_logs')
        .select('id')
        .eq('reference_number', referenceNumber)
        .limit(1);

    if (existingErr) {
        return NextResponse.json({ error: 'Error consultando referencia' }, { status: 500 });
    }

    if (existing?.length) {
        return NextResponse.json({ error: 'Referencia ya utilizada' }, { status: 409 });
    }

    // 2) Insertar en payment_logs con estado pending
  const base = {
    user_id: userId,
    tournament_id: tournamentId,
    reference_number: referenceNumber,
    amount_bs: amountBs,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  const attempts = [
    { owner_id: userId, bank_origin: bankOrigin, phone_emitter: phoneEmitter || null, ...base },
    { bank_origin: bankOrigin, phone_emitter: phoneEmitter || null, ...base },
    { bank_origin: bankOrigin, ...base },
    { ...base },
  ] as const;

  let insertErr: any = null;
  for (const payload of attempts) {
    const res = await supabase.from('payment_logs').insert(payload as any);
    insertErr = res.error;
    if (!insertErr) break;
    // En conflicto por referencia, no seguimos intentando variaciones.
    if (String((insertErr as any)?.message || '').toLowerCase().includes('reference_number')) break;
  }

    if (insertErr) {
        // Carrera: si el UNIQUE(reference_number) salta a último momento.
        if (String((insertErr as any).message || '').toLowerCase().includes('reference_number')) {
            return NextResponse.json({ error: 'Referencia ya utilizada' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Error al reportar el pago' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}

