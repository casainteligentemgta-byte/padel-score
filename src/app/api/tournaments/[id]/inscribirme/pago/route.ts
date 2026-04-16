import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authServerSupabase';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

type PagoMavilReportBody = {
    bankOrigin?: string;
    phoneEmitter?: string;
    referenceNumber?: string;
};

const now = () => new Date().toISOString();

function normalizeDigits(input: string): string {
    return String(input || '').replace(/\D+/g, '');
}

function normalizeRef(input: string): string {
    return normalizeDigits(input).trim();
}

function isPagoMovilMethod(method: string | undefined | null): boolean {
    const s = String(method ?? '')
        .toLowerCase()
        .replace(/\s+/g, '');
    return s.includes('pagomovil') || (s.includes('pago') && (s.includes('movil') || s.includes('móvil')));
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const uid = authResult.uid;

    const { id: tournamentId } = await params;
    if (!tournamentId) return NextResponse.json({ error: 'ID de torneo requerido' }, { status: 400 });

    let body: PagoMavilReportBody = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
    }

    const bankOrigin = String(body.bankOrigin ?? '').trim();
    const phoneEmitter = String(body.phoneEmitter ?? '').trim();
    const referenceNumber = normalizeRef(body.referenceNumber ?? '');

    if (!bankOrigin) return NextResponse.json({ error: 'Banco de origen requerido' }, { status: 400 });
    if (!phoneEmitter) return NextResponse.json({ error: 'Teléfono emisor requerido' }, { status: 400 });
    if (!/^\d{4,8}$/.test(referenceNumber)) {
        return NextResponse.json({ error: 'La referencia debe tener 4-8 dígitos.' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json({ error: 'Configuración del servidor: falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 501 });
    }

    // 1) Anti-fraude: referencia ya reportada?
    const { data: existingLogs } = await supabase
        .from('payment_logs')
        .select('id')
        .eq('reference_number', referenceNumber)
        .limit(1);

    if (existingLogs && existingLogs.length > 0) {
        return NextResponse.json({ error: 'Esta referencia ya ha sido reportada' }, { status: 409 });
    }

    // 2) Buscar inscripciones pendientes del usuario (Pago Móvil) sin referencia cargada.
    const { data: pendingRows, error: listError } = await supabase
        .from('inscriptions')
        .select('id, data')
        .eq('owner_id', uid)
        .eq('tournament_id', tournamentId)
        .eq('payment_status', 'pending');

    if (listError) {
        return NextResponse.json({ error: 'Error al consultar inscripciones pendientes' }, { status: 500 });
    }

    const targets = (pendingRows || []).filter((r: any) => {
        const d = (r.data ?? {}) as any;
        const method = d?.paymentMethod ?? d?.payment_method;
        const existingRef = String(d?.paymentReference ?? '').trim();
        const refOk = !existingRef;
        return refOk && isPagoMovilMethod(method);
    });

    if (targets.length === 0) {
        return NextResponse.json(
            { error: 'No encontramos inscripciones pendientes de Pago Móvil para completar.' },
            { status: 404 }
        );
    }

    const firstTargetId = String(targets[0]?.id ?? '');

    // 3) Registrar el log de antifraude
    const { error: logInsertErr } = await supabase.from('payment_logs').insert({
        owner_id: uid,
        tournament_id: tournamentId,
        inscription_id: firstTargetId || null,
        reference_number: referenceNumber,
        bank_origin: bankOrigin,
        phone_emitter: phoneEmitter,
        created_at: now(),
    });

    if (logInsertErr) {
        // Por si hay carrera, devolvemos el mismo mensaje “ya reportada”.
        return NextResponse.json({ error: 'Esta referencia ya ha sido reportada' }, { status: 409 });
    }

    // 4) Actualizar data JSON de cada inscripción en pending
    for (const t of targets) {
        const currentData = (t.data ?? {}) as Record<string, unknown>;
        const nextData = {
            ...currentData,
            paymentMethod: 'Pago Móvil',
            paymentBank: bankOrigin,
            phone: phoneEmitter,
            telefono: phoneEmitter,
            paymentReference: referenceNumber,
            paymentDate: currentData?.paymentDate ?? new Date().toISOString().split('T')[0],
        };

        const { error: updErr } = await supabase
            .from('inscriptions')
            .update({
                payment_status: 'pending',
                data: nextData,
                updated_at: now(),
            })
            .eq('id', String(t.id));

        if (updErr) {
            // Si falla una, dejamos info genérica.
            return NextResponse.json({ error: 'Error al guardar el reporte en Supabase.' }, { status: 500 });
        }
    }

    return NextResponse.json({ ok: true, updated: targets.length });
}

