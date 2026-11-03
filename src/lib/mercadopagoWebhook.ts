/**
 * Validación de webhooks de Mercado Pago (HMAC-SHA256, manifest oficial).
 * https://www.mercadopago.com.mx/developers/en/docs/your-integrations/notifications/webhooks
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export type MercadoPagoSignatureParts = {
    ts: string;
    v1: string;
};

export function parseMercadoPagoSignatureHeader(header: string | null): MercadoPagoSignatureParts | null {
    if (!header) return null;
    let ts = '';
    let v1 = '';
    for (const part of header.split(',')) {
        const [rawKey, ...rest] = part.split('=');
        const key = rawKey?.trim();
        const value = rest.join('=').trim();
        if (key === 'ts') ts = value;
        if (key === 'v1') v1 = value;
    }
    if (!ts || !v1) return null;
    return { ts, v1 };
}

/**
 * `data.id` del query (preferido por MP) o del body. Alfanumérico → minúsculas.
 */
export function mercadoPagoDataId(requestUrl: string, bodyDataId?: unknown): string {
    const fromQuery = new URL(requestUrl).searchParams.get('data.id') ?? '';
    const raw = (fromQuery || (bodyDataId != null ? String(bodyDataId) : '')).trim();
    if (!raw) return '';
    return /^[a-z0-9]+$/i.test(raw) ? raw.toLowerCase() : raw;
}

export function buildMercadoPagoManifest(input: {
    dataId: string;
    requestId: string;
    ts: string;
}): string {
    const parts: string[] = [];
    if (input.dataId) parts.push(`id:${input.dataId}`);
    if (input.requestId) parts.push(`request-id:${input.requestId}`);
    if (input.ts) parts.push(`ts:${input.ts}`);
    return parts.length ? `${parts.join(';')};` : '';
}

export function verifyMercadoPagoWebhookSignature(input: {
    xSignature: string | null;
    xRequestId: string | null;
    dataId: string;
    secret: string;
}): boolean {
    const parsed = parseMercadoPagoSignatureHeader(input.xSignature);
    if (!parsed || !input.secret) return false;

    const manifest = buildMercadoPagoManifest({
        dataId: input.dataId,
        requestId: (input.xRequestId || '').trim(),
        ts: parsed.ts,
    });
    if (!manifest) return false;

    const expected = createHmac('sha256', input.secret).update(manifest).digest('hex');
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(parsed.v1, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}

const AMOUNT_TOLERANCE = 0.05;

export function amountsMatch(expected: number, received: number, tolerance = AMOUNT_TOLERANCE): boolean {
    if (!Number.isFinite(expected) || !Number.isFinite(received)) return false;
    if (expected <= 0 || received <= 0) return false;
    return Math.abs(expected - received) <= tolerance;
}

export const MERCADOPAGO_EXPECTED_CURRENCY = 'USD';
