import { NextResponse } from 'next/server';

/** BCV dólar oficial (VES por 1 USD) — dolarapi.com, sin clave. */
const DOLARAPI_BCV = 'https://ve.dolarapi.com/v1/dolares/oficial';

export async function GET() {
    const fromEnv = process.env.BCV_VES_PER_USD;
    if (fromEnv) {
        const n = parseFloat(String(fromEnv).replace(',', '.'));
        if (Number.isFinite(n) && n > 0) {
            return NextResponse.json({
                vesPerUsd: n,
                source: 'env' as const,
                fechaActualizacion: null,
            });
        }
    }
    try {
        const res = await fetch(DOLARAPI_BCV, { next: { revalidate: 1800 } });
        if (!res.ok) {
            return NextResponse.json(
                { vesPerUsd: null, source: 'error' as const, error: `dolarapi_http_${res.status}` },
                { status: 502 }
            );
        }
        const data = (await res.json()) as { promedio?: number; fechaActualizacion?: string; nombre?: string };
        const promedio = Number(data.promedio);
        if (!Number.isFinite(promedio) || promedio <= 0) {
            return NextResponse.json(
                { vesPerUsd: null, source: 'error' as const, error: 'invalid_payload' },
                { status: 502 }
            );
        }
        return NextResponse.json({
            vesPerUsd: promedio,
            source: 'dolarapi' as const,
            fechaActualizacion: data.fechaActualizacion ?? null,
            nombre: data.nombre,
        });
    } catch {
        return NextResponse.json(
            { vesPerUsd: null, source: 'error' as const, error: 'fetch_failed' },
            { status: 502 }
        );
    }
}
