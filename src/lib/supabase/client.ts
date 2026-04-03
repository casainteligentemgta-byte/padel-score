import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_SUPABASE === '1') {
    console.log('[Supabase] URL configurada:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[Supabase] Anon key configurada:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
    if (!supabaseUrl || !supabaseAnonKey) {
        const errorMsg = `ERROR CONFIG: ${!supabaseUrl ? 'Falta URL. ' : ''}${!supabaseAnonKey ? 'Falta Key.' : ''}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    if (!client) {
        client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    }
    return client;
}

/** Devuelve el cliente y no lanza si las variables están configuradas. */
export function getSupabaseClient(): SupabaseClient | null {
    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }
    if (!client) client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    return client;
}
