import type { ExpressMatch } from '@/types/expressMatch';
import type { ExpressSessionUpdateResult } from '@/lib/expressMatchDb';

/**
 * PATCH del marcador Express vía API (service role + session_id como token).
 * Sustituye writes directos del cliente a `express_matches` cuando RLS no permite UPDATE anónimo.
 */
export async function patchExpressMatchBySession(
    sessionId: string,
    updates: Partial<ExpressMatch>
): Promise<ExpressSessionUpdateResult> {
    try {
        const res = await fetch(`/api/express/session/${encodeURIComponent(sessionId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates }),
        });
        const json = (await res.json().catch(() => ({}))) as {
            ok?: boolean;
            match?: ExpressMatch;
            error?: string;
            reason?: 'error' | 'stale_session';
        };
        if (!res.ok || !json.ok || !json.match) {
            return {
                ok: false,
                reason: json.reason === 'stale_session' ? 'stale_session' : 'error',
                message: json.error || 'No se pudo guardar el marcador.',
            };
        }
        return { ok: true, match: json.match };
    } catch (e) {
        return {
            ok: false,
            reason: 'error',
            message: e instanceof Error ? e.message : 'Error de red',
        };
    }
}
