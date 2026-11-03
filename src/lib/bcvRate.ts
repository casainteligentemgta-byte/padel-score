/**
 * Tasa BCV (bolívares por 1 USD) para validar pagos en el servidor.
 * Prioridad: BCV_VES_PER_USD; si no, dolarapi.com (revalidación 30 min).
 */

const DOLARAPI_BCV = 'https://ve.dolarapi.com/v1/dolares/oficial';

export type BcvRateResult = {
    vesPerUsd: number | null;
    source: 'env' | 'dolarapi' | 'error';
    fechaActualizacion?: string | null;
    nombre?: string;
    error?: string;
};

export async function getBcvVesPerUsd(): Promise<BcvRateResult> {
    const fromEnv = process.env.BCV_VES_PER_USD;
    if (fromEnv) {
        const n = parseFloat(String(fromEnv).replace(',', '.'));
        if (Number.isFinite(n) && n > 0) {
            return { vesPerUsd: n, source: 'env', fechaActualizacion: null };
        }
    }
    try {
        const res = await fetch(DOLARAPI_BCV, { next: { revalidate: 1800 } });
        if (!res.ok) {
            return { vesPerUsd: null, source: 'error', error: `dolarapi_http_${res.status}` };
        }
        const data = (await res.json()) as { promedio?: number; fechaActualizacion?: string; nombre?: string };
        const promedio = Number(data.promedio);
        if (!Number.isFinite(promedio) || promedio <= 0) {
            return { vesPerUsd: null, source: 'error', error: 'invalid_payload' };
        }
        return {
            vesPerUsd: promedio,
            source: 'dolarapi',
            fechaActualizacion: data.fechaActualizacion ?? null,
            nombre: data.nombre,
        };
    } catch {
        return { vesPerUsd: null, source: 'error', error: 'fetch_failed' };
    }
}
