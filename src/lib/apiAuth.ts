/**
 * Helpers para enviar el token de autenticación en las peticiones a las APIs protegidas.
 * Uso: headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) }
 */

import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * Devuelve el header Authorization con el JWT de Supabase.
 * Las APIs usan authServerSupabase y esperan este token.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
    const supabase = getSupabaseClient();
    if (!supabase) return {};
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return {};
        return { Authorization: `Bearer ${session.access_token}` };
    } catch {
        return {};
    }
}
