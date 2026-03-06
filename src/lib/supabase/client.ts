import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
    }
    if (!client) {
        client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    }
    return client;
}

/** Devuelve el cliente solo en el cliente y si las variables están configuradas (no lanza). */
export function getSupabaseClient(): SupabaseClient | null {
    if (typeof window === 'undefined') return null;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    if (!client) client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    return client;
}
