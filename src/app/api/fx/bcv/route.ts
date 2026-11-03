import { NextResponse } from 'next/server';
import { getBcvVesPerUsd } from '@/lib/bcvRate';

/** BCV dólar oficial (VES por 1 USD) — env o dolarapi.com. */
export async function GET() {
    const result = await getBcvVesPerUsd();
    if (result.vesPerUsd == null) {
        return NextResponse.json(
            { vesPerUsd: null, source: 'error' as const, error: result.error || 'unavailable' },
            { status: 502 }
        );
    }
    return NextResponse.json({
        vesPerUsd: result.vesPerUsd,
        source: result.source,
        fechaActualizacion: result.fechaActualizacion ?? null,
        nombre: result.nombre,
    });
}
